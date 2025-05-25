// 判斷是否在投票時間內（台灣時間）
function isWithinVotingTime() {
    const now = new Date();
    const taiwanNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
    const start = new Date("2025-06-02T10:00:00+08:00");
    const end = new Date("2025-06-02T13:15:00+08:00");
    return taiwanNow >= start && taiwanNow <= end;
}

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
        if (!isWithinVotingTime()) {
            messageDiv.textContent = '目前不是開放投票時間';
            return;
        }
        voteBtn.disabled = true;  // 點下立即禁用
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
                voteBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = '投票時發生錯誤。';
            voteBtn.disabled = false;
        }
    });
});