document.addEventListener('DOMContentLoaded', async () => {
    const boothId = window.location.pathname.split('/')[2];
    const voteBtn = document.getElementById('voteBtn');
    const messageDiv = document.getElementById('message');
    const boothNumber = document.getElementById('boothNumber');
    const voteCount = document.getElementById('voteCount');

    // 顯示攤位編號
    // boothNumber.textContent = boothId;
    boothNumber.textContent = boothId.toString().padStart(3, '0');


    voteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ boothId })
            });
            
            const data = await response.json();
            if (data.success) {
                messageDiv.textContent = '投票成功！窗口即將關閉...';
                setTimeout(() => history.back(), 2000);
                setTimeout(() => window.close(), 2000);
            } else {
                messageDiv.textContent = '投票失敗，請重試。';
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = '投票時發生錯誤。';
        }
    });
});