'use client';

import ResultClassifiedTable from '@/components/ResultClassifiedTable';

export default function ResultCompletePage() {
    return (
        <ResultClassifiedTable
            status="complete"
            title="Result Survey Complete"
            description="Menampilkan data responden yang telah menyelesaikan seluruh survei (progress 100%)."
        />
    );
}
