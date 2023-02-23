from revChatGPT.V1 import Chatbot
import pickle
import os
import time
import requests
import json

class Stat:
    cnt = 0
    conversation_id = None
    parent_id = None
    time = time.time()


def save_variable(v, filename):
    f = open(filename, 'wb')
    pickle.dump(v, f)
    f.close()
    return filename


def load_variable(filename):
    f = open(filename, 'rb')
    r = pickle.load(f)
    f.close()
    return r


def init():
    return Chatbot(config={
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJ0b3BnZWFydG1kQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJnZW9pcF9jb3VudHJ5IjoiSlAifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InVzZXJfaWQiOiJ1c2VyLUw3UENzVG1NUkVLdHRHcmdqRjFad3l6TiJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDMxODkwMzUwNTkyMDc5ODUyNDQiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjc2ODgyMjIwLCJleHAiOjE2NzgwOTE4MjAsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MifQ.dfAVzPV0vrfyLQlpGqW-xl9sdkfQoutehxCIDLfg5HIowMhG0WseTiERiI1xP0rIstTr-Cpj1Jg1xl5TwqWTd1SuimAhbxQeX_Ka8agGyidbzJ7Xao2KxMLxact1Tgnbmqj4IiF_byJlx78j_A20v4PzIQU_jeO2MiLAJdxuMLIQrZI1zcmAuAUzWh9D1pGuL498yNqfjQx2s3cJ2UXAoZIeXtO3bpA5jErd7GsIXDFlqNs47mIbj16uwOdyhmeBFNuyNykgRdKekyrQ2nj80Qtks6I1V5g0Xaxi_nMH-eYn7_4vh8tzOXHmiZvJW3rlXQ9nGyNUZ1ExKqoQrhtNkg"
    }), Stat()


def ask(prompt: str, ip: str):
    if os.path.exists(f"chatbot_{ip}") and os.path.exists(f"stat_{ip}"):
        chatbot = load_variable(f"chatbot_{ip}")
        stat = load_variable(f"stat_{ip}")
        if time.time() - stat.time > 600:
            chatbot, stat = init()
    else:
        chatbot, stat = init()

    success = False
    prev_text = ""
    total_message = ""
    try_times = 2
    while success is False:
        try:
            for data in chatbot.ask(prompt, stat.conversation_id):
                message = data["message"][len(prev_text):]
                total_message += message
                prev_text = data["message"]
            success = True
        except Exception as result:
            try_times -= 1
            if try_times <= 0:
                total_message = "【暂时无法连接ChatGPT，请稍后再试】"
                if os.path.exists(f"chatbot_{ip}") and os.path.exists(f"stat_{ip}"):
                    os.remove(f"chatbot_{ip}")
                    os.remove(f"stat_{ip}")
                return total_message
            prev_text = ""
            total_message = "【上一个ChatGPT丢失连接，为您重新连接新的ChatGPT】"
            chatbot, stat = init()
            success = False
    stat.cnt += 1
    stat.time = time.time()
    if stat.conversation_id is None:
        stat.conversation_id = chatbot.conversation_id
        stat.parent_id = chatbot.parent_id
    save_variable(chatbot, f"chatbot_{ip}")
    save_variable(stat, f"stat_{ip}")
    print(f"{stat.time}：用户{ip}正在进行第{stat.cnt}次对话，发送内容是【{prompt}】")
    return total_message


def get_response(url: str):
    try:
        response = requests.get(url)
        result = json.loads(response.text)
        return json.dumps(result, ensure_ascii=False)
    except Exception as result:
        return f"{result}"

