document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('voteChart').getContext('2d');

    // 獲取所有攤位的票數
    async function fetchVotes() {
        try {
            const response = await fetch('/votes');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching votes:', error);
            return [];
        }
    }

    // 初始化圖表
    const votes = await fetchVotes();
    const labels = votes.map((_, index) => `攤位 ${index + 1}`);
    const data = votes.map(booth => booth.votes);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '票數',
                data: data,
                backgroundColor: '#4CAF50',
                borderColor: '#45a049',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
});