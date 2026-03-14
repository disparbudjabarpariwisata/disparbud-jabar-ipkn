import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const normalize = (s: string) => s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'complete'; // complete | on_progress | no_progress
        const institutionFilter = searchParams.get('institution') || '';

        // 1. Fetch roles
        const { data: rolesData, error: rolesError } = await supabaseAdmin
            .from('role_types')
            .select('id, name')
            .eq('active', true);
        if (rolesError) throw rolesError;

        const roleNameToId: Record<string, string> = {};
        const roleIdToName: Record<string, string> = {};
        rolesData?.forEach(r => {
            roleNameToId[r.name] = r.id;
            roleIdToName[r.id] = r.name;
        });

        // 2. Fetch all respondents from the 3 active survey tables
        const surveyTables = [
            'survey_perangkat_daerah',
            'survey_pemerintah_terkait',
            'survey_pemda_kabkota',
        ];

        let allRespondents: any[] = [];
        for (const table of surveyTables) {
            const { data, error } = await supabaseAdmin
                .from(table)
                .select('id, institution, email, pic_name, role_name, updated_at');
            if (!error && data) {
                const mapped = data.map(r => ({
                    ...r,
                    role_id: roleNameToId[r.role_name] || null,
                }));
                allRespondents = allRespondents.concat(mapped);
            }
        }

        // Apply institution filter early if provided
        if (institutionFilter) {
            allRespondents = allRespondents.filter(r => r.institution === institutionFilter);
        }

        // Note: Don't return early if allRespondents is empty for no_progress,
        // because we still need to show unregistered institutions from survey_questions
        if (allRespondents.length === 0 && status !== 'no_progress') {
            return NextResponse.json({ success: true, data: [], institutions: [] });
        }

        // 3. Fetch all required questions
        const { data: requiredQuestions, error: qError } = await supabaseAdmin
            .from('survey_questions')
            .select('id, role_id, institution_name, question_type, question_text, depends_on_question_id, depends_on_answer, sort_order')
            .eq('is_required', true)
            .eq('active', true)
            .neq('question_type', 'section_break')
            .neq('question_type', 'file_upload');
        if (qError) throw qError;

        const requiredQuestionsByRole: Record<string, any[]> = {};
        requiredQuestions?.forEach(q => {
            if (!requiredQuestionsByRole[q.role_id]) requiredQuestionsByRole[q.role_id] = [];
            requiredQuestionsByRole[q.role_id].push(q);
        });

        // 4. Fetch ALL questions (for display, including non-required ones)
        //    Also fetch section_break questions to build group label lookup
        const { data: allQuestionsIncludingSections } = await supabaseAdmin
            .from('survey_questions')
            .select('id, role_id, question_text, question_type, sort_order, institution_name, options')
            .eq('active', true)
            .order('sort_order', { ascending: true });

        // Build a map from role_id -> sorted questions (including section_breaks)
        const allQuestionsWithSectionsByRole: Record<string, any[]> = {};
        allQuestionsIncludingSections?.forEach(q => {
            if (!allQuestionsWithSectionsByRole[q.role_id]) allQuestionsWithSectionsByRole[q.role_id] = [];
            allQuestionsWithSectionsByRole[q.role_id].push(q);
        });

        // Build group_label maps
        const groupLabelMap: Record<string, string> = {}; // question_id -> section_break label
        const multipleInputLabelsMap: Record<string, string> = {}; // question_id -> joined group labels from schema

        for (const roleId of Object.keys(allQuestionsWithSectionsByRole)) {
            const sortedQuestions = allQuestionsWithSectionsByRole[roleId];
            let currentGroupLabel = '';
            for (const q of sortedQuestions) {
                if (q.question_type === 'section_break') {
                    currentGroupLabel = q.question_text || '';
                } else {
                    groupLabelMap[q.id] = currentGroupLabel;
                    
                    // If it's multiple_input, try to extract labels from its schema
                    if (q.question_type === 'multiple_input' && q.options && q.options.schema && Array.isArray(q.options.schema)) {
                        const labels = q.options.schema
                            .map((item: any) => item.label)
                            .filter((l: any) => !!l);
                        if (labels.length > 0) {
                            multipleInputLabelsMap[q.id] = labels.join(' | ');
                        }
                    }
                }
            }
        }

        // Filter out section_breaks for display
        const allQuestionsByRole: Record<string, any[]> = {};
        allQuestionsIncludingSections?.forEach(q => {
            if (q.question_type === 'section_break') return;
            if (!allQuestionsByRole[q.role_id]) allQuestionsByRole[q.role_id] = [];
            allQuestionsByRole[q.role_id].push(q);
        });

        const questionMap: Record<string, any> = {};
        allQuestionsIncludingSections?.forEach(q => { questionMap[q.id] = q; });

        // 5. Fetch all answers (with fallback if keterangan column doesn't exist yet)
        const respondentIds = allRespondents.map(r => r.id);

        let allAnswers: any[] | null = null;
        let allMultipleAnswers: any[] | null = null;

        if (respondentIds.length > 0) {
            const { data: answersWithKet, error: ketError } = await supabaseAdmin
                .from('survey_answers')
                .select('respondent_id, question_id, answer_text, answer_json, keterangan, updated_at')
                .in('respondent_id', respondentIds);

            if (ketError) {
                // keterangan column may not exist yet, retry without it
                const { data: answersFallback } = await supabaseAdmin
                    .from('survey_answers')
                    .select('respondent_id, question_id, answer_text, answer_json, updated_at')
                    .in('respondent_id', respondentIds);
                allAnswers = answersFallback;
            } else {
                allAnswers = answersWithKet;
            }

            const { data: multiData } = await supabaseAdmin
                .from('survey_multiple_answers')
                .select('respondent_id, question_id, answer_value, group_label, field_label, field_type')
                .in('respondent_id', respondentIds);
            allMultipleAnswers = multiData;
        }

        // Group answers by respondent
        const answersByRespondent: Record<string, any[]> = {};
        const multiAnswersByRespondent: Record<string, any[]> = {};
        const keteranganByRespondent: Record<string, Record<string, string>> = {};

        allAnswers?.forEach(a => {
            if (!answersByRespondent[a.respondent_id]) answersByRespondent[a.respondent_id] = [];
            answersByRespondent[a.respondent_id].push(a);
            if (a.keterangan) {
                if (!keteranganByRespondent[a.respondent_id]) keteranganByRespondent[a.respondent_id] = {};
                keteranganByRespondent[a.respondent_id][a.question_id] = a.keterangan;
            }
        });

        allMultipleAnswers?.forEach(m => {
            if (!multiAnswersByRespondent[m.respondent_id]) multiAnswersByRespondent[m.respondent_id] = [];
            multiAnswersByRespondent[m.respondent_id].push(m);
        });

        // 6. Calculate progress for each respondent + build result rows
        const resultRows: any[] = [];
        const allInstitutions = new Set<string>();

        for (const user of allRespondents) {
            allInstitutions.add(user.institution);
            if (!user.role_id) continue;

            const userRequiredQuestions = requiredQuestionsByRole[user.role_id] || [];
            const userAnswersArr = answersByRespondent[user.id] || [];
            const userMultiArr = multiAnswersByRespondent[user.id] || [];

            // Build answer maps
            const answersMap: Record<string, any> = {};
            let latestUpdate = user.updated_at;

            userAnswersArr.forEach((a: any) => {
                if (a.answer_json) answersMap[a.question_id] = a.answer_json;
                else answersMap[a.question_id] = a.answer_text;
                if (a.updated_at && new Date(a.updated_at) > new Date(latestUpdate)) {
                    latestUpdate = a.updated_at;
                }
            });

            const multiAnswersMap: Record<string, any[]> = {};
            userMultiArr.forEach((m: any) => {
                if (!multiAnswersMap[m.question_id]) multiAnswersMap[m.question_id] = [];
                multiAnswersMap[m.question_id].push(m);
            });

            const normalizedUserInst = normalize(user.institution || '');

            // Filter applicable required questions
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

            let validAnswerCount = 0;
            if (requiredCount > 0) {
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
            }

            let progress = requiredCount === 0 ? 0 : Math.round((validAnswerCount / requiredCount) * 100);
            progress = progress > 100 ? 100 : progress;

            // Filter by status
            if (status === 'complete' && progress !== 100) continue;
            if (status === 'on_progress' && (progress <= 0 || progress >= 100)) continue;
            if (status === 'no_progress' && progress !== 0) continue;

            // Build rows: one row per question with its answer
            const userAllQuestions = allQuestionsByRole[user.role_id] || [];

            // Filter questions applicable to this user's institution
            const displayQuestions = userAllQuestions.filter((q: any) => {
                if (q.institution_name) {
                    const normalizedQInst = normalize(q.institution_name);
                    if (normalizedQInst !== normalizedUserInst) return false;
                }
                return true;
            });

            for (const q of displayQuestions) {
                let actualAnswer = '';
                const ans = answersMap[q.id];
                if (ans !== null && ans !== undefined) {
                    if (Array.isArray(ans)) {
                        actualAnswer = ans.join(', ');
                    } else {
                        actualAnswer = String(ans);
                    }
                }

                // Include multiple answers detail
                const multiDetail = multiAnswersMap[q.id];
                let groupLabels = '';
                if (multiDetail && multiDetail.length > 0) {
                    // Extract unique group labels
                    const uniqueLabels = [...new Set(
                        multiDetail
                            .filter((d: any) => d.group_label && String(d.group_label).trim() !== '')
                            .map((d: any) => String(d.group_label))
                    )];
                    groupLabels = uniqueLabels.join(' | ');

                    const multiTexts = multiDetail
                        .filter((d: any) => d.answer_value && String(d.answer_value).trim() !== '')
                        .map((d: any) => `${d.group_label} → ${d.field_label}: ${d.answer_value}`);
                    if (multiTexts.length > 0) {
                        actualAnswer = actualAnswer ? `${actualAnswer} | ${multiTexts.join(' | ')}` : multiTexts.join(' | ');
                    }
                }

                resultRows.push({
                    institution: user.institution,
                    email: user.email,
                    respondent_name: user.pic_name || 'NN',
                    question_text: q.question_text,
                    question_type: q.question_type,
                    answer: actualAnswer,
                    group_label: multipleInputLabelsMap[q.id] || groupLabels || groupLabelMap[q.id] || '',
                    keterangan: (keteranganByRespondent[user.id] || {})[q.id] || '',
                    progress: progress,
                    updated_at: latestUpdate,
                });
            }
        }

        // 7. For no_progress status: also include institutions from survey_questions
        //    that have NO registered respondent at all (Not Assign Responden)
        if (status === 'no_progress') {
            // Get all institution_name values from active questions
            const { data: questionsWithInst } = await supabaseAdmin
                .from('survey_questions')
                .select('id, role_id, institution_name, question_text, question_type, sort_order')
                .eq('active', true)
                .not('institution_name', 'is', null)
                .neq('question_type', 'section_break')
                .order('sort_order', { ascending: true });

            if (questionsWithInst) {
                // Get set of all registered institution names (normalized)
                const registeredInstSet = new Set(
                    allRespondents.map(r => normalize(r.institution || ''))
                );

                // Group questions by institution_name
                const unregInstitutionQuestions = new Map<string, any[]>();
                questionsWithInst.forEach(q => {
                    if (q.institution_name && q.institution_name.trim()) {
                        const normalizedName = normalize(q.institution_name);
                        if (!registeredInstSet.has(normalizedName)) {
                            if (!unregInstitutionQuestions.has(q.institution_name.trim())) {
                                unregInstitutionQuestions.set(q.institution_name.trim(), []);
                            }
                            unregInstitutionQuestions.get(q.institution_name.trim())!.push(q);
                        }
                    }
                });

                // Apply institution filter if set
                for (const [instName, questions] of unregInstitutionQuestions) {
                    if (institutionFilter && instName !== institutionFilter) continue;

                    for (const q of questions) {
                        resultRows.push({
                            institution: instName,
                            email: 'Not Assign Responden',
                            respondent_name: '-',
                            question_text: q.question_text,
                            question_type: q.question_type,
                            answer: '',
                            group_label: multipleInputLabelsMap[q.id] || groupLabelMap[q.id] || '',
                            keterangan: '',
                            progress: 0,
                            updated_at: null,
                            isUnregistered: true,
                        });
                    }
                }

                // Also add unregistered institution names to the institution filter list
                for (const instName of unregInstitutionQuestions.keys()) {
                    allInstitutions.add(instName);
                }
            }
        }

        // Collect all institutions for the filter dropdown (before status filtering)
        // We need to re-fetch to get ALL institution names, not just filtered ones
        let institutionList: string[] = [];
        if (!institutionFilter) {
            const instSet = new Set<string>();
            for (const table of surveyTables) {
                const { data } = await supabaseAdmin.from(table).select('institution');
                data?.forEach((r: any) => { if (r.institution) instSet.add(r.institution); });
            }
            // Also add unregistered institution names from questions
            allInstitutions.forEach(inst => instSet.add(inst));
            institutionList = Array.from(instSet).sort();
        } else {
            institutionList = [institutionFilter];
        }

        return NextResponse.json({
            success: true,
            data: resultRows,
            institutions: institutionList,
        });

    } catch (error: any) {
        console.error('Survey Results Classified API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error.' }, { status: 500 });
    }
}
