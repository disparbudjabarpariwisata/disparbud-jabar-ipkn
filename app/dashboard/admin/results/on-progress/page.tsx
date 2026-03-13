'use client';

import ResultClassifiedTable from '@/components/ResultClassifiedTable';

export default function ResultOnProgressPage() {
    return (
        <ResultClassifiedTable
            status="on_progress"
            title="Result Survey On Progress"
            description="Menampilkan data responden yang sedang dalam proses pengisian survei (progress > 0% dan < 100%)."
        />
    );
}
