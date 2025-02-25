import axios from 'axios';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';

// 配置 marked 以支持代码高亮
marked.setOptions({
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return code;
    }
});

export default class AI {
    static apiUrl = 'http://localhost:11434/api';

    static async getOllamaApiList() {
        const res = await axios.get(`${this.apiUrl}/tags`);
        return res?.data?.models || [];
    }
    static async chat (model, messages) {
        const url = `${this.apiUrl}/chat`;
        const requestData = {
            model: model,
            messages: messages,
            stream: true // 开启流式响应
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            return new ReadableStream({
                async start(controller) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            controller.close();
                            break;
                        }
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop();

                        for (const line of lines) {
                            if (line.trim() !== '') {
                                try {
                                    const chunk = JSON.parse(line);
                                    controller.enqueue(chunk);
                                } catch (error) {
                                    console.error('Error parsing JSON chunk:', error);
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error in Ollama chat API:', error);
            throw error;
        }
    }
    // 将流式渲染封装起来
    static async renderChat (params = {
        model: 'deepseek-r1:1.5b',
        messages: [],
        thinkOutputId: 'think-output',
        contentOutputId: 'content-output',
    }, callback) {
        let fullText = '';
        let isInThink = false;
        let contentSoFar = '';
        let thinkOutput = document.getElementById(params?.thinkOutputId);
        if (!thinkOutput) {
            console.error('找不到think输出区域');
            return;
        }
        let contentOutput = document.getElementById(params?.contentOutputId);
        if (!contentOutput) {
            console.error('找不到content输出区域');
            return;
        }
        function processChunk(chunk) {
            let index = 0;
            while (index < chunk.length) {
                if (isInThink) {
                    const endIndex = chunk.indexOf('</think>', index);
                    if (endIndex !== -1) {
                        const thinkPart = chunk.slice(index, endIndex);
                        renderThink(thinkPart, true);
                        isInThink = false;
                        index = endIndex + 8; // Skip </think>
                    } else {
                        const thinkPart = chunk.slice(index);
                        renderThink(thinkPart, false);
                        index = chunk.length;
                    }
                } else {
                    const startIndex = chunk.indexOf('<think>', index);
                    if (startIndex !== -1) {
                        if (startIndex > index) {
                            contentSoFar += chunk.slice(index, startIndex);
                            renderContent(contentSoFar);
                        }
                        isInThink = true;
                        index = startIndex + 7; // Skip <think>
                    } else {
                        contentSoFar += chunk.slice(index);
                        renderContent(contentSoFar);
                        index = chunk.length;
                    }
                }
            }
        }
        
        function renderThink(thinkText, isEnd = false) {
            if (isEnd) {
                thinkOutput.textContent += thinkText;
            } else {
                thinkOutput.textContent += thinkText;
            }
        }
        
        function renderContent(content) {
            const html = marked.parse(content);
            contentOutput.innerHTML = html;
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    
        try {
            const stream = await this.chat(params?.model, params?.messages);
            const reader = stream.getReader();
    
            const processStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        callback(fullText);
                        break;
                    }
                    // 处理接收到的消息
                    const chunk = value?.message?.content || '';
                    fullText += chunk;
                    processChunk(chunk);
                }
            };
    
            processStream();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    static async generate (params) {
        const res = await axios.post(`${this.apiUrl}/generate`, params)
        return res;
    }

    static async generateText (params, onChunkReceived) {
        try {
            const url = `${this.apiUrl}/generate`;
            const data = {
                model: params?.model,
                prompt: params?.prompt,
                stream: params.stream ? true : false
            };
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim()!== '');
    
                lines.forEach(line => {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            onChunkReceived(parsed.response);
                        }
                    } catch (error) {
                        console.error('解析 JSON 时出错:', error);
                    }
                });
            }
        } catch (error) {
            console.error('请求出错:', error);
        }
    };
}