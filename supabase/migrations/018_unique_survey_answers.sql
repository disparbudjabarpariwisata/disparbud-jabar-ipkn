-- Add unique constraint to allow upserting survey answers
ALTER TABLE survey_answers
ADD CONSTRAINT unique_respondent_question UNIQUE (respondent_id, question_id);
