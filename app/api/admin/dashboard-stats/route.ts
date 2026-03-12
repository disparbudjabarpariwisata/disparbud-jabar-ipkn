import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Normalize institution names to handle parentheses inconsistencies
const normalize = (s: string) => s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        console.log("Fetching dashboard stats API...");

        // 1. Define all respondent tables and their default role IDs
        const surveyTables = [
            'survey_perangkat_daerah',
            'survey_pemerintah_terkait',
            'survey_pemda_kabkota',
            'survey_pemerintah_pusat',
            'survey_swasta_terkait',
            'survey_pelaku_usaha',
            'survey_komunitas',
            'survey_international_tourism'
        ];

        // Fetch all roles to map name -> role_id mapping
        const { data: rolesData, error: rolesError } = await supabaseAdmin.from('role_types').select('id, name');
        if (rolesError) throw rolesError;
        
        const roleNameToId: Record<string, string> = {};
        rolesData?.forEach(r => { roleNameToId[r.name] = r.id; });

        // 2. Fetch all respondents across all tables
        let allRespondents: any[] = [];
        for (const table of surveyTables) {
            const { data, error } = await supabaseAdmin
                .from(table)
                .select('id, institution, email, role_name, updated_at');
            
            if (!error && data) {
                // Ensure respondents are tagged with their role_id inferred from role_name
                const mapped = data.map(r => ({
                    ...r,
                    role_id: roleNameToId[r.role_name] || null
                }));
                allRespondents = allRespondents.concat(mapped);
            }
        }

        // 3. Fetch all required questions 
        const { data: requiredQuestions, error: qError } = await supabaseAdmin
            .from('survey_questions')
            .select('id, role_id, institution_name, question_type, depends_on_question_id, depends_on_answer')
            .eq('is_required', true)
            .eq('active', true)
            .neq('question_type', 'section_break')
            .neq('question_type', 'file_upload');

        if (qError) throw qError;

        // Group required questions by role_id
        const requiredQuestionsByRole: Record<string, any[]> = {};
        requiredQuestions?.forEach(q => {
            if (!requiredQuestionsByRole[q.role_id]) requiredQuestionsByRole[q.role_id] = [];
            requiredQuestionsByRole[q.role_id].push(q);
        });

        // 4. Fetch all answers
        const { data: allAnswers } = await supabaseAdmin
            .from('survey_answers')
            .select('respondent_id, question_id, answer_text, answer_json, updated_at');

        const { data: allMultipleAnswers } = await supabaseAdmin
            .from('survey_multiple_answers')
            .select('respondent_id, question_id, answer_value');

        // Group answers by respondent
        const answersByRespondent: Record<string, any[]> = {};
        const multiAnswersByRespondent: Record<string, any[]> = {};

        allAnswers?.forEach(a => {
            if (!answersByRespondent[a.respondent_id]) answersByRespondent[a.respondent_id] = [];
            answersByRespondent[a.respondent_id].push(a);
        });

        allMultipleAnswers?.forEach(m => {
            if (!multiAnswersByRespondent[m.respondent_id]) multiAnswersByRespondent[m.respondent_id] = [];
            multiAnswersByRespondent[m.respondent_id].push(m);
        });

        // 5. Calculate progress for each respondent
        const progressList = [];

        for (const user of allRespondents) {
            if (!user.role_id) continue;

            const userRequiredQuestions = requiredQuestionsByRole[user.role_id] || [];
            const userAnswersArr = answersByRespondent[user.id] || [];
            const userMultiArr = multiAnswersByRespondent[user.id] || [];

            // Find last update time from answers, fallback to respondent row
            let lastUpdate = user.updated_at;
            userAnswersArr.forEach(a => {
                if (new Date(a.updated_at) > new Date(lastUpdate)) {
                    lastUpdate = a.updated_at;
                }
            });

            const answersMap: Record<string, any> = {};
            userAnswersArr.forEach((a: any) => {
                if (a.answer_json) answersMap[a.question_id] = a.answer_json;
                else answersMap[a.question_id] = a.answer_text;
            });

            const multiAnswersMap: Record<string, any[]> = {};
            userMultiArr.forEach((m: any) => {
                if (!multiAnswersMap[m.question_id]) multiAnswersMap[m.question_id] = [];
                multiAnswersMap[m.question_id].push(m);
            });

            const normalizedUserInst = normalize(user.institution || '');

            const applicableQuestions = userRequiredQuestions.filter((q: any) => {
                if (q.institution_name) {
                    const normalizedQInst = normalize(q.institution_name);
                    if (normalizedQInst !== normalizedUserInst) return false;
                }

                if (q.depends_on_question_id && q.depends_on_answer) {
                    const parentAns = answersMap[q.depends_on_question_id];
                    if (!parentAns) return false;

                    if (Array.isArray(parentAns)) {
                        if (!parentAns.includes(q.depends_on_answer)) return false;
                    } else {
                        if (String(parentAns) !== q.depends_on_answer) return false;
                    }
                }

                return true;
            });

            const requiredCount = applicableQuestions.length;

            if (requiredCount === 0) {
                progressList.push({
                    id: user.id,
                    institution: user.institution,
                    email: user.email,
                    progress: 0,
                    lastUpdate: lastUpdate
                });
                continue;
            }

            let validAnswerCount = 0;

            applicableQuestions.forEach((q: any) => {
                const ans = answersMap[q.id];
                let isAnswered = false;

                if (q.question_type === 'multiple_input') {
                    if (ans === 'Tidak Ada') {
                        isAnswered = true;
                    } else if (ans === 'Ada') {
                        const detailAnswers = multiAnswersMap[q.id];
                        if (detailAnswers && detailAnswers.length > 0) {
                            const hasFilledDetail = detailAnswers.some((d: any) =>
                                d.answer_value && String(d.answer_value).trim() !== ''
                            );
                            isAnswered = hasFilledDetail;
                        }
                    }
                } else {
                    if (Array.isArray(ans)) {
                        if (ans.length > 0) isAnswered = true;
                    } else if (ans !== null && ans !== undefined) {
                        if (String(ans).trim() !== '') isAnswered = true;
                    }
                }

                if (isAnswered) validAnswerCount++;
            });

            let progress = Math.round((validAnswerCount / requiredCount) * 100);
            progress = progress > 100 ? 100 : progress;
            
            progressList.push({
                id: user.id,
                institution: user.institution,
                email: user.email,
                progress: progress,
                lastUpdate: lastUpdate
            });
        }

        // Sort progress list by latest update 
        progressList.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());

        // 6. Fetch "Link Publikasi"
        // First find URL-type questions or those mentioning publikasi
        const { data: linkQuestions } = await supabaseAdmin
            .from('survey_questions')
            .select('id, question_text')
            .or('question_type.in.(url_basic,url_youtube,url_gdrive),question_text.ilike.%publikasi%,question_text.ilike.%dokumentasi%');
            
        const linkQuestionIds = linkQuestions?.map(q => q.id) || [];
        
        let publications: any[] = [];
        
        if (linkQuestionIds.length > 0) {
            // Find answers to these specific questions
            const linkAnswers = allAnswers?.filter(a => linkQuestionIds.includes(a.question_id) && a.answer_text?.trim() !== '') || [];
            
            // Map respondent ID back to institution
            const respondentMap: Record<string, any> = {};
            allRespondents.forEach(r => { respondentMap[r.id] = r; });
            
            for (const ans of linkAnswers) {
                const respondent = respondentMap[ans.respondent_id];
                const question = linkQuestions?.find(q => q.id === ans.question_id);
                
                if (respondent && question) {
                    publications.push({
                        id: ans.respondent_id + '_' + ans.question_id,
                        institution: respondent.institution,
                        question: question.question_text,
                        url: ans.answer_text,
                        lastUpdate: ans.updated_at
                    });
                }
            }
        }
        
        // Sort publications latest first
        publications.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());

        return NextResponse.json({ 
            success: true, 
            progress: progressList,
            publications: publications
        });

    } catch (error: any) {
        console.error('Dashboard Stats API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error.' }, { status: 500 });
    }
}
