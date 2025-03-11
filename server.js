const WebSocket = require('ws');
const port = 3000;

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port });

// 存储所有玩家的分数
let scores = {};

// 当有新的WebSocket连接时
wss.on('connection', (ws) => {
    console.log('新玩家连接');

    // 当收到消息时
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // 处理不同类型的消息
            switch (data.type) {
                case 'updateScore':
                    // 更新玩家分数
                    scores[data.username] = {
                        score: data.score,
                        difficulty: data.difficulty
                    };
                    // 广播更新后的分数给所有客户端
                    broadcastScores();
                    break;
                    
                case 'requestScores':
                    // 发送当前所有分数给请求的客户端
                    ws.send(JSON.stringify({
                        type: 'scores',
                        scores: scores
                    }));
                    break;
            }
        } catch (error) {
            console.error('处理消息时出错:', error);
        }
    });

    // 当连接关闭时
    ws.on('close', () => {
        console.log('玩家断开连接');
    });
});

// 广播分数给所有连接的客户端
function broadcastScores() {
    const message = JSON.stringify({
        type: 'scores',
        scores: scores
    });
    
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log(`WebSocket服务器运行在端口 ${port}`);