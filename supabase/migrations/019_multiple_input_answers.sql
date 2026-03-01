-- 019_multiple_input_answers.sql

-- Create table to store multiple input survey answers
CREATE TABLE IF NOT EXISTS public.survey_multiple_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    respondent_id UUID NOT NULL,
    role_id UUID NOT NULL,
    question_id UUID NOT NULL,
    group_label TEXT,
    field_label TEXT,
    field_type TEXT,
    answer_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    CONSTRAINT fk_respondent FOREIGN KEY (respondent_id) REFERENCES public.profiles(id),
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.role_types(id),
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES public.survey_questions(id)
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_survey_multiple_answers_respondent_question ON public.survey_multiple_answers(respondent_id, question_id);

-- Set RLS policies
ALTER TABLE public.survey_multiple_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own multiple answers"
    ON public.survey_multiple_answers
    FOR INSERT
    WITH CHECK (auth.uid() = respondent_id);

CREATE POLICY "Users can view their own multiple answers"
    ON public.survey_multiple_answers
    FOR SELECT
    USING (auth.uid() = respondent_id);

CREATE POLICY "Users can update their own multiple answers"
    ON public.survey_multiple_answers
    FOR UPDATE
    USING (auth.uid() = respondent_id);

CREATE POLICY "Admins can view all multiple answers"
    ON public.survey_multiple_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER sync_updated_at_multiple_answers
    BEFORE UPDATE ON public.survey_multiple_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Modify the specific question for DPMPTSP to be 'multiple_input'
DO $$
DECLARE
    v_role_id UUID;
    v_question_id UUID;
    v_question_text TEXT := 'Bagaimana kemudahan perusahaan-perusahaan di provinsi anda dalam mematuhi peraturan pemerintah dan persyaratan administratif (misalnya izin, pelaporan, undang)?';
BEGIN
    SELECT id INTO v_role_id FROM role_types WHERE name = 'Perangkat Daerah Provinsi Jawa Barat' LIMIT 1;
    
    IF v_role_id IS NOT NULL THEN
        UPDATE survey_questions
        SET 
            question_type = 'multiple_input',
            options = '{
                "schema": [
                    {
                        "type": "group",
                        "label": "Laporan Perizinan Berusaha Berbasis Risiko (OSS-RBA) 2024",
                        "fields": [
                            { "label": "Ada Dokumen", "type": "file_upload", "description": "jenis file pdf, xlsx, docx" },
                            { "label": "Tidak Ada Dokumen", "type": "textarea", "description": "jelaskan alasan kenapa tidak ada file yang diminta" }
                        ]
                    },
                    {
                        "type": "group",
                        "label": "Laporan Perizinan Berusaha Berbasis Risiko (OSS-RBA) 2025",
                        "fields": [
                            { "label": "Ada Dokumen", "type": "file_upload", "description": "jenis file pdf, xlsx, docx" },
                            { "label": "Tidak Ada Dokumen", "type": "textarea", "description": "jelaskan alasan kenapa tidak ada file yang diminta" }
                        ]
                    },
                    {
                        "type": "dynamic_list",
                        "label": "Apakah ada bukti konten (video/artikel) yang dapat mendukung indikator diatas",
                        "item_label": "Jawaban Bukti Konten",
                        "fields": [
                            { "label": "Judul Bukti Konten", "type": "text" },
                            { "label": "Link Bukti Konten", "type": "url_website" }
                        ]
                    }
                ]
            }'::jsonb
        WHERE role_id = v_role_id 
          AND institution_name = 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)'
          AND question_text = v_question_text;
    END IF;
END $$;
