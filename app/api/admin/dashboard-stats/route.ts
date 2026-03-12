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
        let publications: any[] = [];

        // Fetch all questions so we have their text and type
        const { data: allQuestionsMap } = await supabaseAdmin
            .from('survey_questions')
            .select('id, question_text, question_type');
            
        const questionMap: Record<string, any> = {};
        allQuestionsMap?.forEach(q => { questionMap[q.id] = q; });

        // Helper: Check if string looks like a URL
        const isUrlAnswer = (text: string | null) => {
            if (!text) return false;
            const t = text.trim().toLowerCase();
            if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('www.')) return true;
            
            const domains = [
                'youtube.com', 'youtu.be', 'instagram.com', 'tiktok.com', 
                'drive.google.com', 'facebook.com', 'twitter.com', 'x.com', 
                'linktr.ee', '.go.id', '.com', '.id', '.org', '.net', 'bit.ly', 's.id'
            ];
            for (const d of domains) {
                if (t.includes(d)) return true;
            }
            return false;
        };

        // Helper: Check if question is asking for a link
        const isUrlQuestion = (q: any) => {
            if (!q) return false;
            const type = q.question_type || '';
            const text = (q.question_text || '').toLowerCase();
            return type.startsWith('url_') || 
                   text.includes('publikasi') || 
                   text.includes('dokumentasi') || 
                   text.match(/\blink\b/) || 
                   text.match(/\btautan\b/) || 
                   text.includes('website') || 
                   text.includes('sosial media') ||
                   text.includes('media sosial') ||
                   text.includes('youtube') ||
                   text.includes('instagram') ||
                   text.includes('tiktok');
        };

        // Helper: Check if it's not a dummy answer
        const isValidLinkText = (text: string) => {
            const t = text.trim().toLowerCase();
            const invalidPatterns = ['tidak ada', 'belum', 'belum ada', '-', 'kosong', 'tidak punya', 'tidak', 'n/a', 'na', 'tda', 'tidakada'];
            if (invalidPatterns.includes(t)) return false;
            if (t.length < 4) return false;
            return true;
        };

        // Map respondent ID back to institution BEFORE loops
        const respondentMap: Record<string, any> = {};
        allRespondents.forEach(r => { respondentMap[r.id] = r; });

        // Process all single and JSON answers
        for (const a of allAnswers || []) {
            const q = questionMap[a.question_id];
            
            // Check text answer
            if (a.answer_text && isValidLinkText(a.answer_text)) {
                if (isUrlAnswer(a.answer_text) || isUrlQuestion(q)) {
                    const respondent = respondentMap[a.respondent_id];
                    if (respondent && q) {
                        publications.push({
                            id: `text_${a.respondent_id}_${a.question_id}`,
                            institution: respondent.institution,
                            question: q.question_text,
                            url: a.answer_text.trim(),
                            lastUpdate: a.updated_at
                        });
                    }
                }
            }
            
            // Check JSON answer (often arrays from checkboxes or multiple inputs)
            if (a.answer_json) {
                try {
                    // Try parsing if it's a stringified JSON, otherwise assume it's already object/array
                    const parsed = typeof a.answer_json === 'string' ? JSON.parse(a.answer_json) : a.answer_json;
                    if (Array.isArray(parsed)) {
                        parsed.forEach((item, idx) => {
                            const strItem = String(item).trim();
                            if (strItem && isValidLinkText(strItem) && (isUrlAnswer(strItem) || isUrlQuestion(q))) {
                                const respondent = respondentMap[a.respondent_id];
                                if (respondent && q) {
                                    publications.push({
                                        id: `json_${a.respondent_id}_${a.question_id}_${idx}`,
                                        institution: respondent.institution,
                                        question: q.question_text,
                                        url: strItem,
                                        lastUpdate: a.updated_at
                                    });
                                }
                            }
                        });
                    } else if (typeof parsed === 'object' && parsed !== null) {
                        // Extract any string values from the object
                        Object.values(parsed).forEach((val: any, idx) => {
                            const strVal = String(val).trim();
                            if (strVal && isValidLinkText(strVal) && (isUrlAnswer(strVal) || isUrlQuestion(q))) {
                                const respondent = respondentMap[a.respondent_id];
                                if (respondent && q) {
                                    publications.push({
                                        id: `json_obj_${a.respondent_id}_${a.question_id}_${idx}`,
                                        institution: respondent.institution,
                                        question: q.question_text,
                                        url: strVal,
                                        lastUpdate: a.updated_at
                                    });
                                }
                            }
                        });
                    }
                } catch (e) {
                    // Ignore parsing errors for individual rows
                }
            }
        }
        
        // Process multiple answers table
        for (const m of allMultipleAnswers || []) {
            const q = questionMap[m.question_id];
            if (m.answer_value && isValidLinkText(m.answer_value)) {
                if (isUrlAnswer(m.answer_value) || isUrlQuestion(q)) {
                    const respondent = respondentMap[m.respondent_id];
                    if (respondent && q) {
                        // Use a fallback timestamp since survey_multiple_answers might not have updated_at
                        const timestamp = respondent.updated_at; 
                        publications.push({
                            id: `multi_${m.respondent_id}_${m.question_id}_${Math.random().toString(36).substr(2, 5)}`,
                            institution: respondent.institution,
                            question: q.question_text,
                            url: m.answer_value.trim(),
                            lastUpdate: timestamp
                        });
                    }
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
