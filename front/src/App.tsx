import './App.css';
import React,{ useEffect, useState} from 'react';
import {Layout, Card, Button, Col, Row, Tabs, Divider, List, Typography} from 'antd';
import '@chatui/core/es/styles/index.less';
import './chatui-theme.css';
import './chatui-index.css';
import Chat, {Bubble, MessageProps, QuickReplyItemProps, useMessages} from '@chatui/core';
import {Marked} from '@ts-stack/markdown';

import reactToText from 'react-to-text';

const { Header, Footer, Content } = Layout;


const { Meta } = Card;

function  IsMobile (){

    let plat =navigator.userAgent.match( // 判断不同端
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );

    return plat
}


function App() {
    // const url = 'localhost'; //调试
    const url = 'psplhl-pc.dynv6.net'; //部署

    // 所有页面
    const Page = () => {
        switch (activeKey) {
            case "0" : return tools_page();
            case "1" : return ipaddress_page();
            case "2" : return pcmonitor_page();
            case "3" : return chatgpt_page();
            case "4" : return newbing_page();
            default : return tools_page();
        }
    }

    // 功能1：服务器IP地址获取
    // url:./tools/ipaddress
    // 参数：无
    // 返回：{"ipv4":[字符串], "ipv6":[字符串]}
    const [ipaddress, setipaddress] = useState({ipv4:[], ipv6:[]});
    const ipaddress_api = async () => {
        try {//部署时localhost改为psplhl-pc.dynv6.net
            const response = await fetch('http://'+url+':3001/tools/ipaddress',{method: 'GET', mode: 'cors'})
            console.log(response)
            const result = await response.json()
            setipaddress(result);
        } catch (error: any) {
        }
    }
    const Ipaddress_card = () => {
        return (
            <Card
                hoverable
                style={{width:"-moz-max-content", textAlign:"center", backgroundImage:'http://'+url+':3001/tools/wallpaper-IPAddress.png'}}
                cover={<img alt="IPAddress" src={'http://'+url+':3001/tools/wallpaper-IPAddress.png'} />}
                onClick={(e) => {add("服务器IP地址获取", "1");}}
            >
                <Meta title="服务器IP地址获取" description="获取服务器的最新IPV4和IPV6地址"/>
            </Card>
        )
    }
    const ipaddress_page = () => {
        return (
            <div style={{textAlign:"center"}}>
                <Button onClick={ipaddress_api} style={{width:300}}>点击获取IP地址</Button>
                <Divider orientation="center">IPV4 Address</Divider>
                {ipaddress.ipv4[0] &&
                    <List
                        dataSource={ipaddress.ipv4}
                        renderItem={(item) => (<h4>{item}</h4>)}
                    />
                }
                <Divider orientation="center">IPV6 Address</Divider>
                {ipaddress.ipv6[0] &&
                    <List
                        dataSource={ipaddress.ipv6}
                        renderItem={(item) => (<h4>{item}</h4>)}
                    />
                }
            </div>
        )
    }

    // 功能2：服务器状态监控
    // url:./tools/pcmonitor
    // 参数：无
    // 返回：{"disks":[{}], "networks":[{}], "components":[{}], "memory":{},"system":{},"processes":[{}]}
    const [pcmonitor_timer_id, set_pcmonitor_timer_id] = useState(setInterval(() => pcmonitor_api(),10000000));
    const pcmonitor_timer = async () => {
        set_pcmonitor_timer_id(setInterval(() => pcmonitor_api(),1000))
    }
    const pcmonitor_timer_clear = () => {
        clearInterval(Number(pcmonitor_timer_id))
        console.log("已清除")
    }
    const [pcmonitor, setpcmonitor] = useState({
        "cpus":[{
            "brand":null,
            "name":null,
            "freq":null,
            "usage":null
        }],
        "disks":[{
            "name":null,
            "available_space(MB)":null,
            "total_space(MB)":null
        }],
        "networks":[{
            "interface_name":null,
            "received(MB/s)":null,
            "transmitted(MB/s)":null
        }],
        "components":[{
            "label":null,
            "temperature":null
        }],
        "memory":{
            "total_memory(MB)":null,
            "used_memory(MB)":null,
            "total_swap(MB)":null,
            "used_swap(MB)":null
        },
        "system":{
            "system_name":null,
            "system_os_version":null
        },
        "processes":[{
            "exe":null,
            "cpu_usage":null,
            "memory":null
        }]});
    const pcmonitor_api = async () => {
        try {//部署时localhost改为psplhl-pc.dynv6.net
            const response = await fetch('http://'+url+':3001/tools/pcmonitor',{method: 'GET', mode: 'cors'})
            const result = await response.json()
            setpcmonitor(result);
            console.log(result);
        } catch (error: any) {
        }

    }
    const Pcmonitor_card = () => {
        return (
            <Card
                hoverable
                style={{width:"-moz-max-content", textAlign:"center", backgroundImage:'http://'+url+':3001/tools/wallpaper-PCMonitor.png'}}
                cover={<img alt="PCMonitor" src={'http://'+url+':3001/tools/wallpaper-PCMonitor.png'} />}
                onClick={(e) => {add("服务器状态监控", "2");}}
            >
                <Meta title="服务器状态监控" description="监控服务器的实时状态"/>
            </Card>
        )
    }
    const pcmonitor_page = () => {
        return (
            <div style={{textAlign:"center"}}>
                <Divider orientation="center">系统信息</Divider>
                {pcmonitor.system &&
                    <h4>系统：{pcmonitor.system["system_name"]} {pcmonitor.system["system_os_version"]}&nbsp;&nbsp;&nbsp;&nbsp;
                    </h4>
                }
                <Divider orientation="center">CPU</Divider>
                {pcmonitor.cpus[0] &&
                    <List
                        dataSource={pcmonitor.cpus}
                        renderItem={(item) => (
                            <h4>名称：{item["brand"]} {item["name"]} &nbsp;&nbsp;&nbsp;&nbsp;
                                利用率：{item["usage"]}%&nbsp;&nbsp;&nbsp;&nbsp;
                            </h4>
                        )}
                    />
                }
                <Divider orientation="center">温度</Divider>
                {pcmonitor.components[0] &&
                    <List
                        dataSource={pcmonitor.components}
                        renderItem={(item) => (
                            <h4>名称：{item["label"]}&nbsp;&nbsp;&nbsp;&nbsp;
                                温度：{item["temperature"]}℃&nbsp;&nbsp;&nbsp;&nbsp;
                            </h4>
                        )}
                    />
                }
                <Divider orientation="center">磁盘</Divider>
                {pcmonitor.disks[0] &&
                    <List
                        dataSource={pcmonitor.disks}
                        renderItem={(item) => (
                            <h4>名称：{item["name"]}&nbsp;&nbsp;&nbsp;&nbsp;
                                可用空间：{item["available_space(MB)"]}MB/{item["total_space(MB)"]}MB&nbsp;&nbsp;&nbsp;&nbsp;
                            </h4>
                        )}
                    />
                }
                <Divider orientation="center">内存</Divider>
                {pcmonitor.memory &&
                    <h4>物理内存：{pcmonitor.memory["used_memory(MB)"]}MB/{pcmonitor.memory["total_memory(MB)"]}MB&nbsp;&nbsp;&nbsp;&nbsp;
                        虚拟内存：{pcmonitor.memory["used_swap(MB)"]}MB/{pcmonitor.memory["total_swap(MB)"]}MB&nbsp;&nbsp;&nbsp;&nbsp;
                    </h4>
                }
                <Divider orientation="center">网络</Divider>
                {pcmonitor.networks[0] &&
                    <List
                        dataSource={pcmonitor.networks}
                        renderItem={(item) => (
                            <h4>接口名称：{item["interface_name"]}&nbsp;&nbsp;&nbsp;&nbsp;
                                下载速度：{item["received(MB/s)"]}MB/s&nbsp;&nbsp;&nbsp;&nbsp;
                                上传速度：{item["transmitted(MB/s)"]}MB/s&nbsp;&nbsp;&nbsp;&nbsp;
                            </h4>
                        )}
                    />
                }
                <Divider orientation="center">主要进程</Divider>
                {pcmonitor.processes[0] &&
                    <List
                        dataSource={pcmonitor.processes}
                        renderItem={(item) => (
                            <h4>进程：{item["exe"]}&nbsp;&nbsp;&nbsp;&nbsp;
                                CPU占用率：{item["cpu_usage"]}%&nbsp;&nbsp;&nbsp;&nbsp;
                                内存占用：{item["memory"]}MB&nbsp;&nbsp;&nbsp;&nbsp;
                            </h4>
                        )}
                    />
                }
            </div>
        )
    }

    // 功能3：ChatGPT
    // url:./tools/chatgpt
    // 参数：{"message":字符串}
    // 返回：{"text":字符串}
    const [chatgpt, setchatgpt] = useState({text:""});
    const [searchSwitch_chatgpt, setsearchSwitch_chatgpt] = useState(false);
    const chatgpt_api = async (message: string) => {
        if (searchSwitch_chatgpt) {
            try {//部署时localhost改为psplhl-pc.dynv6.net
                setTyping_chatgpt(true);
                const keyword_command = "如果我要借助网络搜索引擎回答“"+message+"”这个问题，你建议我搜索什么内容？请直接回答搜索内容，并用[]作为起止符号，例如[搜索内容]。不用回复多余的话，不要做解释。"
                console.log("正在询问关键词")
                const keyword_response = await fetch('http://'+url+':3001/tools/chatgpt',
                    {method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({"message":keyword_command, "id":"keyword"})})
                const keyword_result = await keyword_response.json()
                console.log("询问结果是：" + keyword_result.text)
                let max_search = 5
                if (keyword_result.text.indexOf("[") != -1) {
                    const keywords_str = keyword_result.text.substring(keyword_result.text.indexOf("[")+1, keyword_result.text.indexOf("]"))
                    const keywords = keywords_str.split("|")
                    console.log(keywords)
                    let search_words = []
                    let search_results = []
                    for (let i = 0; i < Math.min(keywords.length, 2); i++) {
                        console.log("正在检查关键字：" + keywords[i])
                        search_words.push(keywords[i])
                        const baidusearch = await fetch('http://' + url + ':3001/tools/baidusearch',
                            {
                                method: 'POST',
                                mode: 'cors',
                                headers: {
                                    'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*',
                                },
                                body: JSON.stringify({"keyword": keywords[i]})
                            })
                        const baidusearchresult = await baidusearch.json()
                        search_results.push(baidusearchresult.text)
                        // const response = await fetch('http://' + url + ':3001/tools/request',
                        //     {
                        //         method: 'POST',
                        //         mode: 'cors',
                        //         headers: {
                        //             'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                        //             'Content-Type': 'application/json',
                        //             'Access-Control-Allow-Origin': '*',
                        //         },
                        //         body: JSON.stringify({"url": "https://baike.baidu.com/api/searchui/suggest?wd=" + keywords[i] + "&enc=utf8"})
                        //     })
                        // const result_ = await response.json()
                        // const result = result_.json
                        // const suggest_result = JSON.parse(result)
                        // if ("list" in suggest_result) {
                        //     if (suggest_result.list.length > 0) {
                        //         for (let j = 0; j < Math.min(suggest_result.list.length, 3); j++) {
                        //             if (search_words.indexOf(suggest_result.list[j].lemmaTitle) != -1) {
                        //                 continue
                        //             }
                        //             if (max_search > 0){
                        //                 max_search -= 1
                        //             } else {
                        //                 continue
                        //             }
                        //             console.log("正在搜索：" + suggest_result.list[j].lemmaTitle)
                        //             const response = await fetch('http://' + url + ':3001/tools/request',
                        //                 {
                        //                     method: 'POST',
                        //                     mode: 'cors',
                        //                     headers: {
                        //                         'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                        //                         'Content-Type': 'application/json',
                        //                         'Access-Control-Allow-Origin': '*',
                        //                     },
                        //                     body: JSON.stringify({"url": "https://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=" + suggest_result.list[j].lemmaTitle + '&bk_length=600'})
                        //                 })
                        //             const result_ = await response.json()
                        //             const result = result_.json
                        //             const search_result = JSON.parse(result)
                        //             if ("abstract" in search_result) {
                        //                 search_words.push(suggest_result.list[j].lemmaTitle)
                        //                 search_results.push(search_result.abstract)
                        //                 console.log("搜索结果是：" + search_result.abstract)
                        //             }
                        //         }
                        //     }
                        // }

                    }

                    let learn_command = ""
                    if (search_results.length > 0) {
                        appendMsg_chatgpt({
                            type: 'text',
                            content: { text: "正在搜索【" + search_words.join("、") + "】..." },
                        });
                        setTyping_chatgpt(true);
                        const total_length_limit = 700
                        let total_length = 0
                        let length_group: number[] = []
                        for (let j = 0; j < search_results.length; j++) {
                            total_length += search_results[j].length
                            length_group.push(search_results[j].length)
                        }
                        if (total_length > total_length_limit) {
                            let length_limit: number[] = []
                            let max = 0
                            for (let j = 0; j < length_group.length; j++) {
                                if (length_group[j] > max) {
                                    max = length_group[j]
                                }
                            }
                            let a = 0
                            for (let j = 0; j < length_group.length; j++) {
                                a += max - length_group[j]
                            }
                            const x = Math.ceil((a + total_length - total_length_limit) / length_group.length)
                            for (let j = 0; j < length_group.length; j++) {
                                length_limit[j] = x - (max - length_group[j])
                            }
                            let index = []
                            for (let j = 0; j < length_group.length; j++) {
                                index.push(j)
                            }
                            const sort_index = index.sort((j1,j2)=> {
                                return length_limit[j2]-length_limit[j1]
                            })
                            let sum = 0
                            let index_stop = 0
                            for (let j = 0; j < length_group.length; j++) {
                                sum += length_limit[sort_index[j]]
                                if (sum >= total_length - total_length_limit) {
                                    index_stop = j
                                    break
                                }
                            }
                            let length_limit_final: number[] = []
                            for (let j = 0; j < length_group.length; j++) {
                                length_limit_final.push(0)
                            }
                            for (let j = 0; j < length_group.length; j++) {
                                if (j <= index_stop) {
                                    length_limit_final[sort_index[j]] = length_limit[sort_index[j]]
                                }
                            }
                            console.log(length_group)
                            console.log(length_limit_final)
                            learn_command = "（互联网为你准备了以下网络信息进行参考，请你学习这些网络信息，不要对这些网络信息本身进行回复和解释：" + search_results.map((value, index, array)=>{if (length_limit_final[index] ==0 ) {return "第"+(index+1).toString()+"条信息："+value} else {return "第"+(index+1).toString()+"条信息："+value.substring(0, value.length-length_limit_final[index])+"......"}}).join("；") + "）"
                        } else {
                            learn_command = "（互联网为你准备了以下网络信息进行参考，请你学习这些网络信息，不要对这些网络信息本身进行回复和解释：" + search_results.map((value, index, array)=>"第"+(index+1).toString()+"条信息："+value).join("；") + "）"
                        }
                    }
                    console.log(message+learn_command)
                    const response = await fetch('http://'+url+':3001/tools/chatgpt',
                        {method: 'POST',
                            mode: 'cors',
                            headers: {
                                'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                            body: JSON.stringify({"message":message+learn_command, "id":"normal"})})
                    const result = await response.json()
                    setchatgpt(result);
                    setTyping_chatgpt(false);
                    // 模拟回复消息
                    appendMsg_chatgpt({
                        type: 'text',
                        content: { text: result.text },
                    });
                } else if (keyword_result.text.indexOf("【") != -1) {
                    setchatgpt(keyword_result);
                    setTyping_chatgpt(false);
                    appendMsg_chatgpt({
                        type: 'text',
                        content: { text: keyword_result.text },
                    });
                } else {
                    const response = await fetch('http://'+url+':3001/tools/chatgpt',
                        {method: 'POST',
                            mode: 'cors',
                            headers: {
                                'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                            body: JSON.stringify({"message":message, "id":"normal"})})
                    const result = await response.json()
                    setchatgpt(result);
                    setTyping_chatgpt(false);
                    // 模拟回复消息
                    appendMsg_chatgpt({
                        type: 'text',
                        content: { text: result.text },
                    });
                }

            } catch (error: any) {
            }
        } else {
            try {
                setTyping_chatgpt(true);
                const response = await fetch('http://'+url+':3001/tools/chatgpt',
                    {method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({"message":message, "id":"normal"})})
                const result = await response.json()
                setchatgpt(result);
                setTyping_chatgpt(false);
                // 模拟回复消息
                appendMsg_chatgpt({
                    type: 'text',
                    content: { text: result.text },
                });
            } catch (error: any) {
            }
        }
    }
    const Chatgpt_card = () => {
        return (
            <Card
                hoverable
                style={{width:"-moz-max-content", textAlign:"center", backgroundImage:'http://'+url+':3001/tools/wallpaper-ChatGPT.png'}}
                cover={<img alt="ChatGPT" src={'http://'+url+':3001/tools/wallpaper-ChatGPT.png'} />}
                onClick={(e) => {add("ChatGPT", "3");}}
            >
                <Meta title="ChatGPT" description="直接与ChatGPT对话"/>
            </Card>
        )
    }
    const initialMessages_chatgpt = [
        {
            type: 'text',
            content: { text: '您好！我是ChatGPT！' },
            user: { avatar: 'http://'+url+':3001/tools/image-ChatGPT.png' },
        },
    ];
    // 默认快捷短语，可选
    const defaultQuickReplies_chatgpt = [
        {
            name: '百度搜索功能开关',
            isNew: true,
            isHighlight: true,
        },
        {
            name: '充当英文修饰润色者',
            code: '我想让你充当英语翻译员、拼写纠正员和改进员。我会用任何语言与你交谈，你会检测语言，翻译它并用我的文本的更正和改进版本用英语回答。我希望你用更优美优雅的高级英语单词和句子替换我简化的 A0 级单词和句子。保持相同的意思，但使它们更文艺。我要你只回复更正、改进，不要写任何解释。',
        },
        {
            name: '担任机器学习工程师',
            code: '我想让你担任机器学习工程师。我会写一些机器学习的概念，你的工作就是用通俗易懂的术语来解释它们。这可能包括提供构建模型的分步说明、使用视觉效果演示各种技术，或建议在线资源以供进一步研究。',
        },
        {
            name: '担任院士',
            code: '我要你演院士。您将负责研究您选择的主题，并以论文或文章的形式展示研究结果。您的任务是确定可靠的来源，以结构良好的方式组织材料并通过引用准确记录。',
        },
        {
            name: '充当Linux终端',
            code: '我想让你充当 Linux 终端。我将输入命令，您将回复终端应显示的内容。我希望您只在一个唯一的代码块内回复终端输出，而不是其他任何内容。不要写解释。除非我指示您这样做，否则不要键入命令。当我需要用英语告诉你一些事情时，我会把文字放在中括号内[就像这样]。',
        },
    ];
    // 消息列表
    const { messages: messages_chatgpt, appendMsg: appendMsg_chatgpt, setTyping: setTyping_chatgpt } = useMessages(initialMessages_chatgpt);

    // 发送回调
    async function handleSend_chatgpt(type:string, val:string) {
        if (type === 'text' && val.trim()) {
            appendMsg_chatgpt({
                type: 'text',
                content: { text: val },
                position: 'right',
            });
            const reslut = await chatgpt_api(val);
        }
    }

    // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
    function handleQuickReplyClick_chatgpt(item: QuickReplyItemProps) {
        if (item.name == "百度搜索功能开关")
        {
            setsearchSwitch_chatgpt(!searchSwitch_chatgpt)
            appendMsg_chatgpt({
                type: 'text',
                content: { text: (!searchSwitch_chatgpt)?"百度搜索功能开启":"百度搜索功能关闭"},
                position: 'left',
            });
        } else if (typeof item.code == "string") {
            handleSend_chatgpt('text', item.code);
        } else {
            handleSend_chatgpt('text', item.name);
        }
    }

    function renderMessageContent_chatgpt(msg: MessageProps) {
        const { type, content } = msg;

        // 根据消息类型来渲染
        switch (type) {
            case 'text':
                return <Bubble content={content.text} />;
            case 'image':
                return (
                    <Bubble type="image">
                        <img src={content.picUrl} alt="" />
                    </Bubble>
                );
            default:
                return null;
        }
    }
    const chatgpt_page = () => {
        return (
            <Chat
                navbar={{ title: 'ChatGPT' }}
                messages={messages_chatgpt}
                renderMessageContent={renderMessageContent_chatgpt}
                quickReplies={defaultQuickReplies_chatgpt}
                onQuickReplyClick={handleQuickReplyClick_chatgpt}
                onSend={handleSend_chatgpt}
            />
        )
    }


    // 功能4：NewBing
    // url:./tools/newbing
    // 参数：{"message":字符串}
    // 返回：{"text":字符串}
    const [newbing, setnewbing] = useState({text:""});
    const newbing_api = async (message: string) => {
        try {
            setTyping_newbing(true);
            const response = await fetch('http://'+url+':3001/tools/newbing',
                {method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Access-Control-Request-Headers': 'content-type;access-control-allow-origin',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({"message":message})})
            const result = await response.json()
            setnewbing(result);
            setTyping_newbing(false);
            // 模拟回复消息
            appendMsg_newbing({
                type: 'text',
                content: { text: (<div dangerouslySetInnerHTML={{ __html: Marked.parse(result.text)}}/>) },
            });
        } catch (error: any) {
        }
    }
    const Newbing_card = () => {
        return (
            <Card
                hoverable
                style={{width:"-moz-max-content", textAlign:"center", backgroundImage:'http://'+url+':3001/tools/wallpaper-NewBing.png'}}
                cover={<img alt="NewBing" src={'http://'+url+':3001/tools/wallpaper-NewBing.png'} />}
                onClick={(e) => {add("NewBing", "4");}}
            >
                <Meta title="NewBing" description="直接与NewBing对话"/>
            </Card>
        )
    }
    const initialMessages_newbing = [
        {
            type: 'text',
            content: { text: '您好！我是NewBing！' },
            user: { avatar: 'http://'+url+':3001/tools/image-NewBing.png' },
        },
    ];
    // 默认快捷短语，可选
    const defaultQuickReplies_newbing = [
        {
            name: '充当英文修饰润色者',
            code: '我想让你充当英语翻译员、拼写纠正员和改进员。我会用任何语言与你交谈，你会检测语言，翻译它并用我的文本的更正和改进版本用英语回答。我希望你用更优美优雅的高级英语单词和句子替换我简化的 A0 级单词和句子。保持相同的意思，但使它们更文艺。我要你只回复更正、改进，不要写任何解释。',
        },
        {
            name: '担任机器学习工程师',
            code: '我想让你担任机器学习工程师。我会写一些机器学习的概念，你的工作就是用通俗易懂的术语来解释它们。这可能包括提供构建模型的分步说明、使用视觉效果演示各种技术，或建议在线资源以供进一步研究。',
        },
        {
            name: '担任院士',
            code: '我要你演院士。您将负责研究您选择的主题，并以论文或文章的形式展示研究结果。您的任务是确定可靠的来源，以结构良好的方式组织材料并通过引用准确记录。',
        },
        {
            name: '充当Linux终端',
            code: '我想让你充当 Linux 终端。我将输入命令，您将回复终端应显示的内容。我希望您只在一个唯一的代码块内回复终端输出，而不是其他任何内容。不要写解释。除非我指示您这样做，否则不要键入命令。当我需要用英语告诉你一些事情时，我会把文字放在中括号内[就像这样]。',
        },
    ];
    // 消息列表
    const { messages: messages_newbing, appendMsg: appendMsg_newbing, setTyping: setTyping_newbing } = useMessages(initialMessages_newbing);

    // 发送回调
    async function handleSend_newbing(type:string, val:string) {
        if (type === 'text' && val.trim()) {
            appendMsg_newbing({
                type: 'text',
                content: { text: val },
                position: 'right',
            });
            const reslut = await newbing_api(val);
        }
    }

    // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
    function handleQuickReplyClick_newbing(item: QuickReplyItemProps) {
        if (typeof item.code == "string") {
            handleSend_newbing('text', item.code);
        } else {
            handleSend_newbing('text', item.name);
        }
    }

    function renderMessageContent_newbing(msg: MessageProps) {
        const { type, content } = msg;

        // 根据消息类型来渲染
        switch (type) {
            case 'text':
                return <Bubble content={content.text} />;
            case 'image':
                return (
                    <Bubble type="image">
                        <img src={content.picUrl} alt="" />
                    </Bubble>
                );
            default:
                return null;
        }
    }
    const newbing_page = () => {
        return (
            <Chat
                navbar={{ title: 'NewBing' }}
                messages={messages_newbing}
                renderMessageContent={renderMessageContent_newbing}
                quickReplies={defaultQuickReplies_newbing}
                onQuickReplyClick={handleQuickReplyClick_newbing}
                onSend={handleSend_newbing}
            />
        )
    }


    // 工具卡片页
    const tools_page = () => {
        const col_span = IsMobile()?24:6;
        return (
            <Row>
                <Col span={col_span} style={{padding:8}}>
                    <Ipaddress_card/>
                </Col>
                <Col span={col_span} style={{padding:8}}>
                    <Pcmonitor_card/>
                </Col>
                <Col span={col_span} style={{padding:8}}>
                    <Chatgpt_card/>
                </Col>
                <Col span={col_span} style={{padding:8}}>
                    <Newbing_card/>
                </Col>
            </Row>
        )
    }

    // 分页控制
    const [items, setItems] = useState([{label: "所有工具卡片", key:"0"}]);
    const [activeKey, setActiveKey] = useState("0");
    const onChange = (key: string) => {
        setActiveKey(key);
        if (key=="2") {
            pcmonitor_timer();
        } else {
            pcmonitor_timer_clear();
        }
    };
    const add = (label:string, key:string) => {
        const pane = items.filter((pane) => pane.key == key);
        if (pane.length == 0) {
            // @ts-ignore
            setItems([...items, { label: label, key: key}]);
            setActiveKey(key);
            if (key=="2") {
                pcmonitor_timer();
            } else {
                pcmonitor_timer_clear();
            }
        } else {
            setActiveKey(key);
            if (key=="2") {
                pcmonitor_timer();
            } else {
                pcmonitor_timer_clear();
            }
        }

    };
    const remove = (targetKey: string) => {
        const targetIndex = items.findIndex((pane) => pane.key === targetKey);
        const newPanes = items.filter((pane) => pane.key !== targetKey);
        if (newPanes.length && targetKey === activeKey) {
            const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        setItems(newPanes);
    };
    const onEdit = (targetKey: string, action: 'add' | 'remove') => {
        if (action === 'add') {
        } else {
            remove(targetKey);
        }
    };

    const tab_bar = IsMobile()?"small":"large";
    return (
      <div style={{height:"100%"}}>
          <Row>
              <Col span={24} style={{padding:2}}>
                  <h1 style={{textAlign:"center"}}>ZYHome</h1>
              </Col>
          </Row>
          <Content style={{backgroundColor:"white", height:"100%"}}>
              <Tabs
                  hideAdd
                  onChange={onChange}
                  activeKey={activeKey}
                  type="line"
                  items={items}
                  onEdit={(e, action)=>{onEdit(activeKey,action)}}
                  tabPosition={"top"}
                  size={tab_bar}
                  animated={true}
                  centered={true}
              />
              <Page/>
          </Content>
      </div>
    );
}

export default App;