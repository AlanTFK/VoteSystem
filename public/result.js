document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('voteChart').getContext('2d');

    let chart;

    // 獲取票數最高的前十名攤位
    async function fetchTopVotes() {
        try {
            const response = await fetch('/votes/top');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching top votes:', error);
            return [];
        }
    }

    async function updateChart() {
        const topVotes = await fetchTopVotes();
        const labels = topVotes.map(booth => `攤位 ${booth.booth_id.toString().padStart(3, '0')}`);
        const data = topVotes.map(booth => booth.votes);

        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
        } else {
            chart = new Chart(ctx, {
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
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '票數最高的前十名攤位',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        }
    }

    // 初始化圖表 + 開始定時更新
    await updateChart();
    setInterval(updateChart, 3000); // 每 5 秒自動更新一次
});