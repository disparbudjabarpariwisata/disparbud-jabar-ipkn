import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { respondentIds, roleId, respondentInstitutions } = body;

        // respondentIds: string[] - the IDs of respondents to calculate progress for
        // roleId: string - the role ID
        // respondentInstitutions: Record<string, string> - map of respondentId -> institution name

        if (!respondentIds || !roleId || !respondentInstitutions) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        // 1. Get required questions for this role
        const { data: requiredQuestions, error: qError } = await supabaseAdmin
            .from('survey_questions')
            .select('id, institution_name, question_type, depends_on_question_id, depends_on_answer')
            .eq('role_id', roleId)
            .eq('is_required', true)
            .eq('active', true)
            .neq('question_type', 'section_break');

        if (qError) throw qError;
        if (!requiredQuestions || requiredQuestions.length === 0) {
            // No required questions — everyone is at 0%
            const result: Record<string, number> = {};
            respondentIds.forEach((id: string) => { result[id] = 0; });
            return NextResponse.json({ success: true, progress: result });
        }

        // 2. Fetch all answers and multiple answers for these respondents in bulk
        const { data: allAnswers } = await supabaseAdmin
            .from('survey_answers')
            .select('respondent_id, question_id, answer_text, answer_json')
            .in('respondent_id', respondentIds);

        const { data: allMultipleAnswers } = await supabaseAdmin
            .from('survey_multiple_answers')
            .select('respondent_id, question_id, answer_value')
            .in('respondent_id', respondentIds);

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

        // 3. Calculate progress for each respondent
        const result: Record<string, number> = {};

        for (const respondentId of respondentIds) {
            const userInstitution = respondentInstitutions[respondentId];
            const userAnswersArr = answersByRespondent[respondentId] || [];
            const userMultiArr = multiAnswersByRespondent[respondentId] || [];

            // Build maps
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

            // Normalize institution names to handle parentheses inconsistencies
            // e.g., "(ASITA)" vs "ASITA", "(DPMPTSP)" vs "DPMPTSP"
            const normalize = (s: string) => s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
            const normalizedUserInst = normalize(userInstitution || '');

            // Filter required questions for this user
            const userRequiredQuestions = requiredQuestions.filter((q: any) => {
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

            const requiredCount = userRequiredQuestions.length;

            if (requiredCount === 0) {
                result[respondentId] = 0;
                continue;
            }

            let validAnswerCount = 0;

            userRequiredQuestions.forEach((q: any) => {
                const ans = answersMap[q.id];
                let isAnswered = false;

                if (q.question_type === 'multiple_input') {
                    if (ans === 'Tidak Ada' || ans === 'Ada') {
                        isAnswered = true;
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
            result[respondentId] = progress;
        }

        return NextResponse.json({ success: true, progress: result });

    } catch (error: any) {
        console.error('Progress API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error.' }, { status: 500 });
    }
}
