'use client';

import ResultClassifiedTable from '@/components/ResultClassifiedTable';

export default function ResultNoProgressPage() {
    return (
        <ResultClassifiedTable
            status="no_progress"
            title="Result Survey No Progress"
            description="Menampilkan data responden yang belum mengisi survei sama sekali (progress 0%)."
        />
    );
}
