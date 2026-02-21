-- ============================================================
-- Migration 014: Seed Bulk Survey Questions from Excel
-- ============================================================
-- Source: bulk/bulk_pertanyaan.xlsx (150 rows)
-- All questions belong to role: Perangkat Daerah Provinsi Jawa Barat

DO $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Get the role ID for 'Perangkat Daerah Provinsi Jawa Barat'
  SELECT id INTO v_role_id FROM role_types WHERE name = 'Perangkat Daerah Provinsi Jawa Barat' LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role Perangkat Daerah Provinsi Jawa Barat not found in role_types';
  END IF;

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kanwil Kementerian Hukum (Kemenkum) Jawa Barat', 'Bagaimana indeks supremasi hukum di provinsi anda, beradasarkan rata-rata pada indikator berikut :\n1. Perlindungan hak milik aset\n2. Sistem hukum dan peradilan dalam menyelesaikan perselisihan perusahaan\n3. pengajuan bantahan/keberatan terkait kebijakan dan peraturan yang ada\n4. Tingkat integritas dan potensi risiko korupsi', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 1, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro Hukum dan Hak Asasi Manusia', 'Bagaimana indeks supremasi hukum di provinsi anda, beradasarkan rata-rata pada indikator berikut :\n1. Perlindungan hak milik aset\n2. Sistem hukum dan peradilan dalam menyelesaikan perselisihan perusahaan\n3. pengajuan bantahan/keberatan terkait kebijakan dan peraturan yang ada\n4. Tingkat integritas dan potensi risiko korupsi', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 2, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Bagaimana indeks supremasi hukum di provinsi anda, beradasarkan rata-rata pada indikator berikut :\n1. Perlindungan hak milik aset\n2. Sistem hukum dan peradilan dalam menyelesaikan perselisihan perusahaan\n3. pengajuan bantahan/keberatan terkait kebijakan dan peraturan yang ada\n4. Tingkat integritas dan potensi risiko korupsi', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 3, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kanwil Kementerian ATR/BPN (BPN) Provinsi Jawa Barat', 'Bagaimana indeks supremasi hukum di provinsi anda, beradasarkan rata-rata pada indikator berikut :\n1. Perlindungan hak milik aset\n2. Sistem hukum dan peradilan dalam menyelesaikan perselisihan perusahaan\n3. pengajuan bantahan/keberatan terkait kebijakan dan peraturan yang ada\n4. Tingkat integritas dan potensi risiko korupsi', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 4, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Bagaimana kemudahan perusahaan-perusahaan di provinsi anda dalam mematuhi peraturan pemerintah dan persyaratan administratif (misalnya izin, pelaporan, undang)?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 5, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro Hukum dan Hak Asasi Manusia', 'Bagaimana kemudahan perusahaan-perusahaan di provinsi anda dalam mematuhi peraturan pemerintah dan persyaratan administratif (misalnya izin, pelaporan, undang)?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 6, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro Organisasi', 'Bagaimana kemudahan perusahaan-perusahaan di provinsi anda dalam mematuhi peraturan pemerintah dan persyaratan administratif (misalnya izin, pelaporan, undang)?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 7, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Bagaimana kebijakan pemerintah provinsi anda dalam memastikan stabilitas lingkungan berusaha? (stabilitas lingkungan berusaha mencakup upaya pemerintah daerah dalam menjaga kondisi persaingan dan keberlanjutan usaha)?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 8, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Bagaimana kebijakan pemerintah provinsi anda dalam memastikan stabilitas lingkungan berusaha? (stabilitas lingkungan berusaha mencakup upaya pemerintah daerah dalam menjaga kondisi persaingan dan keberlanjutan usaha)?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 9, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro Perekonomian', 'Bagaimana kebijakan pemerintah provinsi anda dalam memastikan stabilitas lingkungan berusaha? (stabilitas lingkungan berusaha mencakup upaya pemerintah daerah dalam menjaga kondisi persaingan dan keberlanjutan usaha)?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 10, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)', 'Berapa persentase realisasi pembayaran cicilan pokok utang yang jatuh tempo terhadap anggaran pada posisi akhir tahun (bulan desember)?', 'number', '["Persentase (%)"]'::jsonb, true, 11, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Perencanaan Pembangunan Daerah (Bappeda)', 'Berapa persentase realisasi pembayaran cicilan pokok utang yang jatuh tempo terhadap anggaran pada posisi akhir tahun (bulan desember)?', 'number', '["Persentase (%)"]'::jsonb, true, 12, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro Perekonomian', 'Berapa persentase realisasi pembayaran cicilan pokok utang yang jatuh tempo terhadap anggaran pada posisi akhir tahun (bulan desember)?', 'number', '["Persentase (%)"]'::jsonb, true, 13, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Bagaimana peraturan dan kebijakan yang mengatur investasi di provinsi anda?', 'linear_scale', '["1 = sangat dibatasi dengan ketat, 7 = tidak dibatasi sama sekali"]'::jsonb, true, 14, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro BUMD, Investasi dan Administrasi Pembangunan', 'Bagaimana peraturan dan kebijakan yang mengatur investasi di provinsi anda?', 'linear_scale', '["1 = sangat dibatasi dengan ketat, 7 = tidak dibatasi sama sekali"]'::jsonb, true, 15, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Pendapatan Daerah (Bapenda)', 'Sejauh mana sistem perpajakan (prosedur dan mekanisme) di provinsi anda dapat dipatuhi?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 16, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kanwil Direktorat Jenderal Pajak (DJP) Jawa Barat I – Kemenkeu', 'Sejauh mana sistem perpajakan (prosedur dan mekanisme) di provinsi anda dapat dipatuhi?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 17, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Koperasi dan Usaha Kecil', 'Bagaimana pemerintah provinsi anda dalam pemberian akses pembiayaan operasional terhadap UMKM?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 18, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kantor OJK Provinsi Jawa Barat', 'Bagaimana pemerintah provinsi anda dalam pemberian akses pembiayaan operasional terhadap UMKM?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 19, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kepolisian Daerah (Polda) Jawa Barat', 'Bagaimana keandalan kepolisian di provinsi anda dalam penegakkan hukum dan ketertiban?', 'linear_scale', '["1 = tidak dapat diandalkan sama sekali, 7 = sangat dapat diandalkan"]'::jsonb, true, 20, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kepolisian Daerah (Polda) Jawa Barat', 'Berapa persentase (%) penduduk merasa aman berjalan sendirian pada malam hari?', 'number', '["Persentase (%)"]'::jsonb, true, 21, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Satuan Polisi Pamong Praja (Satpol PP) Provinsi Jawa Barat', 'Berapa persentase (%) penduduk merasa aman berjalan sendirian pada malam hari?', 'number', '["Persentase (%)"]'::jsonb, true, 22, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kepolisian Daerah (Polda) Jawa Barat', 'Berapa jumlah kasus pembunuhan per 100.000 populasi?', 'number', 'null'::jsonb, true, 23, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Kesatuan Bangsa dan Politik (Bakesbangpol)', 'Berapa posisi indeks potensi radikalisme?', 'number', 'null'::jsonb, true, 24, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kepolisian Daerah (Polda) Jawa Barat', 'Berapa jumlah kejadian kekerasan terorganisir yang diakibatkan oleh terorisme, konflik suku, agama, ras, dan antargolongan (SARA), separatisme, dan makar?', 'number', 'null'::jsonb, true, 25, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kesehatan', 'Berapa perbandingan jumlah dokter umum dan spesialis terhadap jumlah penduduk dikali 1.000?', 'number', 'null'::jsonb, true, 26, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perumahan dan Permukiman', 'Berapa perbandingan jumlah rumah tangga yang memiliki akses terhadap sanitasi layak dibagi dengan jumlah rumah tangga? (dinyatakan dalam persentase)', 'number', '["Persentase (%)"]'::jsonb, true, 27, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Sumber Daya Air', 'Berapa perbandingan jumlah rumah tangga yang memiliki akses terhadap air minum layak dibagi dengan jumlah rumah tangga? (dinyatakan dalam persentase)', 'number', '["Persentase (%)"]'::jsonb, true, 28, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kesehatan', 'Berapa perbandingan jumlah tempat tidur rumah sakit terhadap jumlah penduduk dikali 1.000?', 'number', '["Rasio"]'::jsonb, true, 29, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kesehatan', 'Berapa perbandingan jumlah penduduk yang terkena penyakit menular terhadap jumlah penduduk dikali 100.000?', 'number', '["Rasio"]'::jsonb, true, 30, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Berapa persentase (%) Penduduk berumur 15 tahun ke atas yang bekerja selama seminggu yang lalu dengan tingkat pendidikan SMP dan SMA (orang) terhadap total seluruh penduduk berumur 15 tahun ke atas yang bekerja selama seminggu yang lalu?', 'number', '["Persentase (%)"]'::jsonb, true, 31, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Berapa persentase (%) Penduduk berumur 15 tahun ke atas yang bekerja selama seminggu yang lalu dengan tingkat pendidikan diploma dan S1 ke atas terhadap total seluruh penduduk berumur 15 tahun ke atas yang bekerja selama seminggu yang lalu?', 'number', '["Persentase (%)"]'::jsonb, true, 32, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pendidikan', 'Bagaimana kualitas sistem pendidikan menengah di provinsi anda dalam memenuhi kebutuhan perekonomian yang kompetitif?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 33, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pendidikan', 'Bagaimana kualitas sistem pendidikan tinggi di provinsi anda dalam memenuhi kebutuhan perekonomian yang kompetitif?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 34, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Bagaimana peraturan di provinsi anda terkait fleksibilitas perekrtutan dan pemutusan hubungan kerja?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 35, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Bagaimana perusahaan-perusahaan di provinsi anda dapat menemukan orang-orang lokal dengan keterampilan yang dibutuhkan?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 36, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Bagaimana perusahaan-perusahaan di provinsi anda menawarkan pengaturan kerja yang fleksibel, seperti kerja jarak jauh dan paruh waktu?', 'linear_scale', '["1 = sangat sulit, 7 = sangat mudah dan efisien"]'::jsonb, true, 37, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Berapa persentase (%) Penduduk berumur 15 tahun ke atas yang bekerja selama seminggu yang lalu dengan populasi penduduk berumur 15 tahun ke atas?', 'number', '["Persentase (%)"]'::jsonb, true, 38, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Bagaimana perusahaan-perusahaan di provinsi anda, dalam memberikan kesempatan kerja yang setara bagi (a) perempuan, (b) mereka yang berasal dari latar belakang agama, etnis atau ras minoritas, (c) penyandang disabilitas, dan (d) kaum marjinal lainnya?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 39, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Berapa rata-rata nilai yang telah dinormalisasi dari :\n1. Jumlah pekerja/buruh pada perusahaan yang memiliki peraturan perusahaan/perjanjian kerja bersama (PP/PKB) per provinsi dibandingkan dengan jumlah pekerja/buruh pada perusahaan yang seharusnya memiliki PP/PKB per provinsi;\n2. Jumlah pekerja/buruh pada perusahaan yang memiliki lembaga kerja sama bipartit per provinsi dibandingkan dengan jumlah pekerja/buruh pada perusahaan yang seharusnya memiliki lemaba kerja sama bipartit per provinsi;\n3. Jumlah pekerja/buruh pada perusahaan yang memiliki PP/PKB dan menjadi peserta jaminan sosial ketenagakerjaan per provinsi dibandingkan dengan jumlah pekerja/buruh pada perusahaan yang seharusnya memiliki PP/PKB dan menjadi peserta jaminan sosial ketenagakerjaan per provinsi;\n4. Jumlah pekerja/buruh pada perusahaan yang memiliki PP/PKB dan struktur skala upah per provinsi dibandingkan dengan jumlah pekerja/buruh pada perusahaan yang seharusnya memiliki PP/PKB dan struktur skala upah per provinsi;\n5.Jumlah perusahaan yang menerapkan perlindungan hak-hak pekerja dan dialog sosial di Wajib Lapor Ketenagakerjaan Perusahaan (WLKP) online per provinsi dibandingkan dengan jumlah perusahaan per provinsi', 'number', '["Rasio"]'::jsonb, true, 40, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pemberdayaan Perempuan, Perlindungan Anak dan Keluarga Berencana', 'Berapa persentase (%) jumlah penduduk provinsi berumur 15 tahun ke atas yang bekerja selama seminggu yang lalu dengan jenis kelamin laki-laki dibagi dengan penduduk provinsi berumur 15 tahun ke atas yang bekerja selama seminggu yang lalu dengan jenis kelamin perempuan?', 'number', '["Persentase (%)"]'::jsonb, true, 41, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kesehatan', 'Berapa rasio penduduk yang memiliki JKN?', 'number', '["Rasio"]'::jsonb, true, 42, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)', 'Berapa persentase (%) postur realisasi Anggaran Pendapatan dan Belanja Daerah (APBD) Belanja Bantuan Sosial dengan PDRB per Kapita Atas Dasr Harga Berlaku?', 'number', '["Persentase (%)"]'::jsonb, true, 43, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Sosial', 'Berapa persentase (%) postur realisasi Anggaran Pendapatan dan Belanja Daerah (APBD) Belanja Bantuan Sosial dengan PDRB per Kapita Atas Dasr Harga Berlaku?', 'number', '["Persentase (%)"]'::jsonb, true, 44, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Berapa persentase (%) penduduk berusia 5 (lima) tahun ke atas yang menggunakan atau mengakses internet dalam 3 (tiga) bulan terakhir?', 'number', '["Persentase (%)"]'::jsonb, true, 45, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Berapa persentase (%) pelanggan terlayani jaringan internet akses tetap pitalebar (fixed broadband) terhadap total rumah tangga?', 'number', '["Persentase (%)"]'::jsonb, true, 46, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perumahan dan Permukiman', 'Berapa persentase (%) pelanggan terlayani jaringan internet akses tetap pitalebar (fixed broadband) terhadap total rumah tangga?', 'number', '["Persentase (%)"]'::jsonb, true, 47, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Berapa persentase (%) pengguna internet yang menggunakan telepon seluler di provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 48, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Berapa persentase (%) cakupan dari sinyal 3G di provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 49, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Perencanaan Pembangunan Daerah (Bappeda)', 'Berapa rasio pengguna platform keuangan digital per penduduk usia 15 (lima belas) tahun ke atas yang dihitung menggunakan data jumlah kartu ATM/debit, kartu kredit dan uang elektronik dengan jumlah pernduduk usia 15 (lima belas) tahun ke atas per provinsi?', 'number', '["Rasio"]'::jsonb, true, 50, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Berapa rasio pengguna platform keuangan digital per penduduk usia 15 (lima belas) tahun ke atas yang dihitung menggunakan data jumlah kartu ATM/debit, kartu kredit dan uang elektronik dengan jumlah pernduduk usia 15 (lima belas) tahun ke atas per provinsi?', 'number', '["Rasio"]'::jsonb, true, 51, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kantor Perwakilan Bank Indonesia Provinsi Jawa Barat', 'Berapa rasio pengguna platform keuangan digital per penduduk usia 15 (lima belas) tahun ke atas yang dihitung menggunakan data jumlah kartu ATM/debit, kartu kredit dan uang elektronik dengan jumlah pernduduk usia 15 (lima belas) tahun ke atas per provinsi?', 'number', '["Rasio"]'::jsonb, true, 52, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Kantor OJK Provinsi Jawa Barat', 'Berapa rasio pengguna platform keuangan digital per penduduk usia 15 (lima belas) tahun ke atas yang dihitung menggunakan data jumlah kartu ATM/debit, kartu kredit dan uang elektronik dengan jumlah pernduduk usia 15 (lima belas) tahun ke atas per provinsi?', 'number', '["Rasio"]'::jsonb, true, 53, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Di provinsi anda, bagaimana penggunaan platform digital pada layanan transportasi dan pengiriman?', 'linear_scale', '["1 = tidak menggunakan sama sekali, 7 = digunakan pada sebagian besar layanan"]'::jsonb, true, 54, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Di provinsi anda, bagaimana penggunaan platform digital pada layanan transportasi dan pengiriman?', 'linear_scale', '["1 = tidak menggunakan sama sekali, 7 = digunakan pada sebagian besar layanan"]'::jsonb, true, 55, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Di provinsi anda, bagaimana penggunaan platform digital pada layanan hotel, restoran, dan aktivitas rekreasi?', 'linear_scale', '["1 = tidak menggunakan sama sekali, 7 = digunakan pada sebagian besar layanan"]'::jsonb, true, 56, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Di provinsi anda, bagaimana penggunaan platform digital pada layanan hotel, restoran, dan aktivitas rekreasi?', 'linear_scale', '["1 = tidak menggunakan sama sekali, 7 = digunakan pada sebagian besar layanan"]'::jsonb, true, 57, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)', 'Berapa persentase (%) jumlah anggaran sektor pariwisata dari total keseluruhan anggaran pemerintah provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 58, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Perencanaan Pembangunan Daerah (Bappeda)', 'Berapa persentase (%) jumlah anggaran sektor pariwisata dari total keseluruhan anggaran pemerintah provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 59, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa persentase (%) jumlah anggaran sektor pariwisata dari total keseluruhan anggaran pemerintah provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 60, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rentang nilai untuk ketersediaan data pariwisata?', 'number', '["Ordinal 0 - 30"]'::jsonb, true, 61, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa jumlah ketersediaan data terbaru berdasarkan indikator jenis data?', 'number', '["Ordinal 0 - 24"]'::jsonb, true, 62, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio desa wisata yang terdaftar dalam JADESTA per 100 (seratus) desa pada provinsi?', 'number', '["Rasio"]'::jsonb, true, 63, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pemberdayaan Masyarakat dan Desa', 'Berapa rasio desa wisata yang terdaftar dalam JADESTA per 100 (seratus) desa pada provinsi?', 'number', '["Rasio"]'::jsonb, true, 64, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara jumlah wisatawan menurut provinsi tujuan ditambahkan dengan jumlah populasi yang ada di daerah tersebut, dibagi dengan luas wilayah?', 'number', '["Rasio"]'::jsonb, true, 65, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Berapa rasio antara jumlah wisatawan menurut provinsi tujuan ditambahkan dengan jumlah populasi yang ada di daerah tersebut, dibagi dengan luas wilayah?', 'number', '["Rasio"]'::jsonb, true, 66, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa jumlah penyelenggaraan event berskala daerah, nasional maupun internasional yang diselenggarakan di suatu provinsi yang diselenggarakan selama 3 (tiga) tahun terakhir?', 'number', '["Ordinal"]'::jsonb, true, 67, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Bagaimana penyediaan layanan hotel, restoran, dan kegiatan rekreasi di provinsi anda?', 'linear_scale', '["1 = sangat tidak kompetitif, 7 = sangat kompetitif"]'::jsonb, true, 68, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara jumlah perjalan wisatawan nusantara provinsi asal dibagi dengan jumlah penduduk? (gross travel propensity)', 'number', '["Rasio"]'::jsonb, true, 69, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa indeksasi harga rata-rata kamar yang dibayarkan?', 'number', '["Rasio"]'::jsonb, true, 70, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Berapa indeksasi harga rata-rata kamar yang dibayarkan?', 'number', '["Rasio"]'::jsonb, true, 71, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Pendapatan Daerah (Bapenda)', 'Berapa harga bahan bakar bermotor dengan oktan 92', 'number', '["Ordinal"]'::jsonb, true, 72, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Energi dan Sumber Daya Mineral', 'Berapa harga bahan bakar bermotor dengan oktan 92', 'number', '["Ordinal"]'::jsonb, true, 73, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro Perekonomian', 'Berapa harga bahan bakar bermotor dengan oktan 92', 'number', '["Ordinal"]'::jsonb, true, 74, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Di provinsi anda, bagaimana efisiensi (dalam hal frekuensi, ketepatan waktu, kecepatan, harga, ketersediaan konektivitas) pada layanan transportasi udara (jika ada)', 'linear_scale', '["1 = sangat tidak efisien, 7 = sangat efisien"]'::jsonb, true, 75, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Berapa rasio antara ketersediaan tempat duduk pesawat yang menuju provinsi setiap tahunnya (domestik dan internasional) per jumlah penduduk?', 'number', '["Rasio"]'::jsonb, true, 76, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Berapa banyak maskapai penerbangan yang beroperasi di semua bandara di provinsi?', 'number', '["Ordinal"]'::jsonb, true, 77, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Berapa jumlah koneksi ke bandara lain di luar provinsi (domestik dan internasional) untuk mengukur tingkat integrasi provinsi dalam jaringan udara nasional?', 'number', '["Ordinal"]'::jsonb, true, 78, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Bina Marga dan Penataan Ruang', 'Bagaimana kualitas infrastruktur jalan yang ada di provinsi anda?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 79, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Bagaimana kualitas infrastruktur jalan yang ada di provinsi anda?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 80, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perumahan dan Permukiman', 'Bagaimana kualitas infrastruktur jalan yang ada di provinsi anda?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 81, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Berapa persentase (%) panjang jalan provinsi beraspal?', 'number', '["Persentase (%)"]'::jsonb, true, 82, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Di provinsi anda, bagaimana efisiensi (dalam hal frekuensi, ketepatan waktu, kecepatan, harga, ketersediaan konektivitas) pada layanan transportasi kereta api (jika tersedia)?', 'linear_scale', '["1 = sangat tidak efisien, 7 = sangat efisien"]'::jsonb, true, 83, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Berapa rasio antara jumlah kabupaten/kota yang memiliki stasiun dibandingkan dengan jumlah kota pada provinsi?', 'number', '["Rasio"]'::jsonb, true, 84, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Di provinsi anda, bagaimana efisiensi (dalam hal frekuensi, ketepatan waktu, kecepatan, harga, ketersediaan konektivitas) pada layanan transportasi umum, dan lain-lain?', 'linear_scale', '["1 = sangat tidak efisien, 7 = sangat efisien"]'::jsonb, true, 85, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Di provinsi anda, bagaimana efisiensi (dalam hal frekuensi, ketepatan waktu, kecepatan, harga, ketersediaan konektivitas) pada layanan transportasi pelabuhan (seperti feri dan kapal) (jika ada)?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 86, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara banyaknya kamar yang tersedia untuk tamu baik kamar yang terisi maupun tidak terisi dibandingkan dengan 100 (seratus) penduduk provinsi?', 'number', '["Rasio"]'::jsonb, true, 87, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara banyaknya kamar akomodasi bukan hotel berbintang yang tersedia untuk tamu baik kamar yang terisi maupun tidak terisi dibandingkan dengan 100 (seratus) penduduk provinsi?', 'number', '["Rasio"]'::jsonb, true, 88, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara PDRB provinsi sektor jasa perhotelan dan restoran dibagi dengan jumlah tenaga kerja di sektor jasa perhotelan dan restoran per provinsi?', 'number', '["Rasio"]'::jsonb, true, 89, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Berapa rasio antara PDRB provinsi sektor jasa perhotelan dan restoran dibagi dengan jumlah tenaga kerja di sektor jasa perhotelan dan restoran per provinsi?', 'number', '["Rasio"]'::jsonb, true, 90, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Berapa rasio antara PDRB provinsi sektor jasa perhotelan dan restoran dibagi dengan jumlah tenaga kerja di sektor jasa perhotelan dan restoran per provinsi?', 'number', '["Rasio"]'::jsonb, true, 91, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa besar tambahan investasi atau penambahan nilai aset yang dialokasikan untuk setiap tenaga kerja per tahun?', 'number', '["Rasio"]'::jsonb, true, 92, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Berapa besar tambahan investasi atau penambahan nilai aset yang dialokasikan untuk setiap tenaga kerja per tahun?', 'number', '["Rasio"]'::jsonb, true, 93, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro BUMD, Investasi dan Administrasi Pembangunan', 'Berapa besar tambahan investasi atau penambahan nilai aset yang dialokasikan untuk setiap tenaga kerja per tahun?', 'number', '["Rasio"]'::jsonb, true, 94, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Berapa jumlah situs alam warisan dunia yang sudah ditetapkan oleh UNESCO?', 'number', '["Ordinal"]'::jsonb, true, 95, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa jumlah situs alam warisan dunia yang sudah ditetapkan oleh UNESCO?', 'number', '["Ordinal"]'::jsonb, true, 96, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Berapa jumlah sebaran tumbuhan dan satwa liar yang diketahui?', 'number', '["Ordinal"]'::jsonb, true, 97, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Berapa total kawasan konservasi di provinsi?', 'number', '["Ordinal"]'::jsonb, true, 98, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Komunikasi dan Informatika', 'Berapa rentang nilai (0-100) untuk jumlah pencarian dari keseluruhan kata kunci terkait daya tarik wisata alam popular di provinsi?', 'number', '["Ordinal 0-100"]'::jsonb, true, 99, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rentang nilai (0-100) untuk jumlah pencarian dari keseluruhan kata kunci terkait daya tarik wisata alam popular di provinsi?', 'number', '["Ordinal 0-100"]'::jsonb, true, 100, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Perencanaan Pembangunan Daerah (Bappeda)', 'Berapa luas wilayah geografis di darat yang memiliki kesamaan ciri iklim, tanah, air, flora, dan fauna asli, serta pola interaksi manusia dengan alam yang menggambarkan integritas sistem alam dan lingkungan hidup?', 'number', '["Ordinal"]'::jsonb, true, 101, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa jumlah situs warisan budaya yang terdaftar di UNESCO?', 'number', '["Ordinal"]'::jsonb, true, 102, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa jumlah kekayaan warisan budaya tak benda yang telah diakui oleh UNESCO yang dimiliki dan terdaftar di provinsi?', 'number', '["Ordinal"]'::jsonb, true, 103, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pemuda dan Olahraga', 'Jumlah stadion olah raga yang dimiliki oleh provinsi dengan standar nasional dan internasional (FIFA)?', 'number', '["Ordinal"]'::jsonb, true, 104, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rentang nilai (0-100) untuk jumlah pencarian dari keseluruhan kata kunci terkait daya tarik wisata budaya popular di provinsi?', 'number', '["Ordinal 0-100"]'::jsonb, true, 105, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara jumlah KaTa Kreatif dibandingkan dengan jumlah kabupaten dan kota dalam satu provinsi?', 'number', '["Rasio"]'::jsonb, true, 106, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Bagaimana anda mendefinisikan karakteristik kota dan pusat kota di provinsi anda?', 'linear_scale', '["1= sangat padat dan hanya dapat diakses oleh masyarakat tertentu, 7= dapat diakses secara luas dan menyenangkan untuk dikunjungi"]'::jsonb, true, 107, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pendidikan', 'Berapa rasio antara jumlah perguruan tinggi terakreditasi A, B, Unggul, dan Baik Sekali terhadap keseluruhan perguruan tinggi yang terakreditasi di provinsi?', 'number', '["Rasio"]'::jsonb, true, 108, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rentang nilai (0-100) untuk jumlah pencarian dari keseluruhan kata kunci terkait daya tarik wisata nonrekreasi (pendidikan olahraga) popular di provinsi?', 'number', '["Ordinal 0 - 100"]'::jsonb, true, 109, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Energi dan Sumber Daya Mineral', 'Berapa rasio antara produksi emisi gas rumah kaca (CO2) provinsi dengan PDRB sektor akomodasi dna makan minum?', 'number', '["Rasio"]'::jsonb, true, 110, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa rasio antara produksi emisi gas rumah kaca (CO2) provinsi dengan PDRB sektor akomodasi dna makan minum?', 'number', '["Rasio"]'::jsonb, true, 111, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Energi dan Sumber Daya Mineral', 'Berapa rasio antara total emisi sektor energi (minyak dan gas bumi, industri batu bara, perkantoran dan pemukiman, transportasi, manufaktur dan konstruksi, serta industri energi) dengan riil PDRB provinsi?', 'number', '["Rasio"]'::jsonb, true, 112, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa rasio antara total emisi sektor energi (minyak dan gas bumi, industri batu bara, perkantoran dan pemukiman, transportasi, manufaktur dan konstruksi, serta industri energi) dengan riil PDRB provinsi?', 'number', '["Rasio"]'::jsonb, true, 113, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Energi dan Sumber Daya Mineral', 'Berapa persentase (%) energi terbarukan terhadap energi fosil dalam sumber bauran energi primer?', 'number', '["Persentase (%)"]'::jsonb, true, 114, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Energi dan Sumber Daya Mineral', 'Bagaimana upaya pemerintah provinsi anda dalam mendanai dan menyubsidi investasi pada energi dan infrastruktur yang ramah lingkungan dan berkelanjutan (misalnya energi terbarukan, transportasi umum rendah karbon, infrastruktur mobil listrik)?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 115, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 'Bagaimana upaya pemerintah provinsi anda dalam mendanai dan menyubsidi investasi pada energi dan infrastruktur yang ramah lingkungan dan berkelanjutan (misalnya energi terbarukan, transportasi umum rendah karbon, infrastruktur mobil listrik)?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 116, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Biro BUMD, Investasi dan Administrasi Pembangunan', 'Bagaimana upaya pemerintah provinsi anda dalam mendanai dan menyubsidi investasi pada energi dan infrastruktur yang ramah lingkungan dan berkelanjutan (misalnya energi terbarukan, transportasi umum rendah karbon, infrastruktur mobil listrik)?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 117, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa rentang nilai (0-100) untuk Indeks Kualitas Udara (IKU) provinsi berdasarkan laporan statistik Kementerian Lingkungan Hidup?', 'number', '["Ordinal 0 - 100"]'::jsonb, true, 118, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa rentang nilai (0-100) untuk Indeks Kualitas Air (IKA) provinsi berdasarkan laporan statistik Kementerian Lingkungan Hidup?', 'number', '["Ordinal 0 - 100"]'::jsonb, true, 119, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Berapa jumlah rata-rata tutupan lahan (ha/tahun) yang berkurang/hilang (deforestasi) setiap tahunnya?', 'number', '["Rasio"]'::jsonb, true, 120, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa jumlah rata-rata tutupan lahan (ha/tahun) yang berkurang/hilang (deforestasi) setiap tahunnya?', 'number', '["Rasio"]'::jsonb, true, 121, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kesehatan', 'Di provinsi anda, sejauh mana perusahaan-perusahaan memperhitungkan dampak proses produksi terhadap lingkungan dan alam?', 'linear_scale', '["1= tidak ada pengelolaan yang jelas, 7=memiliki pengelolaan yang jelas"]'::jsonb, true, 122, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Di provinsi anda, sejauh mana perusahaan-perusahaan memperhitungkan dampak proses produksi terhadap lingkungan dan alam?', 'linear_scale', '["1= tidak ada pengelolaan yang jelas, 7=memiliki pengelolaan yang jelas"]'::jsonb, true, 123, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Satuan Polisi Pamong Praja (Satpol PP) Provinsi Jawa Barat', 'Di provinsi anda, sejauh mana perusahaan-perusahaan memperhitungkan dampak proses produksi terhadap lingkungan dan alam?', 'linear_scale', '["1= tidak ada pengelolaan yang jelas, 7=memiliki pengelolaan yang jelas"]'::jsonb, true, 124, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kelautan dan Perikanan', 'Berapa rentang nilai (0-100) untuk Indeks Kualitas Air Laut (IKAL) provinsi berdasarkan laporan statistik Kementerian Lingkungan Hidup?', 'number', '["Ordinal 0 - 100"]'::jsonb, true, 125, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kesehatan', 'Berapa rentang nilai (0-100) untuk Indeks Kualitas Air Laut (IKAL) provinsi berdasarkan laporan statistik Kementerian Lingkungan Hidup?', 'number', '["Ordinal 0 - 100"]'::jsonb, true, 126, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa rentang nilai (0-100) untuk Indeks Kualitas Air Laut (IKAL) provinsi berdasarkan laporan statistik Kementerian Lingkungan Hidup?', 'number', '["Ordinal 0 - 100"]'::jsonb, true, 127, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Perhubungan', 'Berapa rentang nilai (0-100) untuk Indeks Kualitas Air Laut (IKAL) provinsi berdasarkan laporan statistik Kementerian Lingkungan Hidup?', 'number', '["Ordinal 0 - 100"]'::jsonb, true, 128, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Bagaimana upaya pemerintah provinsi anda dalam melindungi lingkungan dan alam?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 129, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Bagaimana upaya pemerintah provinsi anda dalam melindungi lingkungan dan alam?', 'linear_scale', '["1 = sangat tidak baik, 7 = sangat baik"]'::jsonb, true, 130, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Berapa persentase (%) total cakupan konservasi terhadap total wilayah di provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 131, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa persentase (%) total cakupan konservasi terhadap total wilayah di provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 132, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Berapa proporsi rata-rata kawasan (per Km2) yang memiliki keanekaragaman hayati kunci yang tercakup dalam kawasan konservasi?', 'number', '["Rasio"]'::jsonb, true, 133, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Lingkungan Hidup', 'Berapa proporsi rata-rata kawasan (per Km2) yang memiliki keanekaragaman hayati kunci yang tercakup dalam kawasan konservasi?', 'number', '["Rasio"]'::jsonb, true, 134, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Pendapatan Daerah (Bapenda)', 'Berapa persentase (%) kontribusi sektor penyediaan akomodasi, dan makan minum triwulanan terhadap dasar harga berlaku menurut lapangan usaha di provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 135, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Perencanaan Pembangunan Daerah (Bappeda)', 'Berapa persentase (%) kontribusi sektor penyediaan akomodasi, dan makan minum triwulanan terhadap dasar harga berlaku menurut lapangan usaha di provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 136, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Koperasi dan Usaha Kecil', 'Berapa persentase (%) kontribusi sektor penyediaan akomodasi, dan makan minum triwulanan terhadap dasar harga berlaku menurut lapangan usaha di provinsi?', 'number', '["Persentase (%)"]'::jsonb, true, 137, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Koperasi dan Usaha Kecil', 'Berapa rasio antara tenaga kerja pariwisata terhadap total penduduk berumur 15 (lima belas) tahun ke atas yang bekerja selama seminggu yang lalu?', 'number', '["Rasio"]'::jsonb, true, 138, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara tenaga kerja pariwisata terhadap total penduduk berumur 15 (lima belas) tahun ke atas yang bekerja selama seminggu yang lalu?', 'number', '["Rasio"]'::jsonb, true, 139, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pendidikan', 'Berapa rasio antara tenaga kerja pariwisata terhadap total penduduk berumur 15 (lima belas) tahun ke atas yang bekerja selama seminggu yang lalu?', 'number', '["Rasio"]'::jsonb, true, 140, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Tenaga Kerja dan Transmigrasi', 'Berapa rasio antara tenaga kerja pariwisata terhadap total penduduk berumur 15 (lima belas) tahun ke atas yang bekerja selama seminggu yang lalu?', 'number', '["Rasio"]'::jsonb, true, 141, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rata-rata upah/gaji bersih sebulan (rupiah) buruh/karyawan/pegawai menurut provinsi dan lapangan pekerjaan utama di 17 (tujuh belas) sektor?', 'number', '["Rasio"]'::jsonb, true, 142, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Badan Perencanaan Pembangunan Daerah (Bappeda)', 'Berapa selisih absolut antara proporsi laki-laki dan perempuan dalam pekerjaan sektor pariwisata dan perjalanan?', 'number', '["Ordinal"]'::jsonb, true, 143, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa selisih absolut antara proporsi laki-laki dan perempuan dalam pekerjaan sektor pariwisata dan perjalanan?', 'number', '["Ordinal"]'::jsonb, true, 144, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rata-rata lama perjalanan wisatawan nusantara (malam per perjalanan) berdasarkan provinsi tujuan?', 'number', '["Rasio"]'::jsonb, true, 145, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa jumlah perjalanan wisatawan nusantara menurut provinsi tujuan (perjalanan)? (Indeks musiman dihitung dengan membagi jumlah dari total 3 (tiga) bulan dimana kunjungan wisatawan berada pada angka tertinggi (Top-3) dengan total kunjungan dalam 1 (satu) tahun)', 'number', '["Rasio"]'::jsonb, true, 146, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara perjalanan wisatawan nusantara yang melakukan kegiatan wisata budaya ke provinsi tujuan?', 'number', '["Rasio"]'::jsonb, true, 147, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Kehutanan', 'Berapa rasio antara perjalanan wisatawan nusantara yang melakukan kegiatan wisata alam ke provinsi tujuan?', 'number', '["Rasio"]'::jsonb, true, 148, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Berapa rasio antara perjalanan wisatawan nusantara yang melakukan kegiatan wisata alam ke provinsi tujuan?', 'number', '["Rasio"]'::jsonb, true, 149, true);

  INSERT INTO survey_questions (role_id, institution_name, question_text, question_type, options, is_required, sort_order, active)
  VALUES (v_role_id, 'Dinas Pariwisata dan Kebudayaan', 'Bagaimana sebaran wisatawan, baik rekreasi dan bisnis, di provinsi anda?', 'linear_scale', '["1= hanya terkonsentrasi di beberapa lokasi saja, 7=menyebar dengan merata"]'::jsonb, true, 150, true);

END $$;