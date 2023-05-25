from revChatGPT.V1 import Chatbot as ChatGPT
import pickle
import os
import time
import requests
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup, Tag
import re
from EdgeGPT import Chatbot as NewBing, ConversationStyle
import asyncio

class Stat_ChatGPT:
    cnt = 0
    conversation_id = None
    parent_id = None
    time = time.time()


class Stat_Newbing:
    cnt = 0
    client_id = None
    conversation_id = None
    conversation_signature = None
    invocation_id = None
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


def init_chatgpt():
    return ChatGPT(config={
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJ0b3BnZWFydG1kQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InVzZXJfaWQiOiJ1c2VyLUw3UENzVG1NUkVLdHRHcmdqRjFad3l6TiJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDMxODkwMzUwNTkyMDc5ODUyNDQiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjgzNzk1NTAyLCJleHAiOjE2ODUwMDUxMDIsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MifQ.oYnguzwQiHbOQ6O-KRYuRST1WRIPhZiEJUaqy795IE2_XLVPEnTj0CCjK16HfxC4Upfz2nr9EZBK1uH52gXf3Fr_ucH3hlBxJup-Hf0dsKLLInR2tVvm9DDeMNiEcPacfCQmrHOuDb6wQE2YR0KpxROH3aJFTQ0tl_3Gn55M15BFZqHu-qJaiOS4YVTf-IBGrcoc153MS_CiUZjNJE9X8wz4Pq9M4gh3O8D3IIrgwiNvTnIHW6VRfneHTHRkkkVAR3s8HxdOSZ1vvDXNyQiCpHQKmNkVwWZChkKu1onWaZgCt3BL7dhf5lV4GGzM2vmDthdczjanIg5Za8EGjFc6jQ"
    }), Stat_ChatGPT()


def ask_chatgpt(prompt: str, id: str, ip: str):
    if os.path.exists(f"chatbot_{id}_{ip}") and os.path.exists(f"stat_{id}_{ip}"):
        try:
            chatbot = load_variable(f"chatbot_{id}_{ip}")
            stat = load_variable(f"stat_{id}_{ip}")
        except:
            total_message = "【暂时无法连接ChatGPT，请稍后再试】"
            return total_message
    else:
        chatbot, stat = init_chatgpt()

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
                if os.path.exists(f"chatbot_{id}_{ip}") and os.path.exists(f"stat_{id}_{ip}"):
                    os.remove(f"chatbot_{id}_{ip}")
                    os.remove(f"stat_{id}_{ip}")
                return total_message
            prev_text = ""
            total_message = "【上一个ChatGPT丢失连接，为您重新连接新的ChatGPT】"
            chatbot, stat = init_chatgpt()
            success = False
    stat.cnt += 1
    stat.time = time.time()
    if stat.conversation_id is None:
        stat.conversation_id = chatbot.conversation_id
        stat.parent_id = chatbot.parent_id
    try:
        save_variable(chatbot, f"chatbot_{id}_{ip}")
        save_variable(stat, f"stat_{id}_{ip}")
        print(f"{stat.time}：用户{ip}正在进行第{stat.cnt}次对话，发送内容是【{prompt}】，回答内容是【{total_message}】")
    except:
        total_message = "【暂时无法连接ChatGPT，请稍后再试】"
        return total_message
    return total_message


def get_response(url: str):
    try:
        response = requests.get(url)
        result = json.loads(response.text)
        return json.dumps(result, ensure_ascii=False)
    except Exception as result:
        return f"{result}"


def check_information_validity(text):
    num_of_chinese_word = 0
    for i in text:
        if i>= u'\u4e00' and i <= u'\u9fa5': #\u4E00 ~ \u9FFF  中文字符
            num_of_chinese_word += 1
    if num_of_chinese_word >= 20 and num_of_chinese_word / len(text) >= 0.5:
        return text
    else:
        return ""


def get_information_about_keyword_by_selenium(keyword):
    browser = webdriver.Edge()

    browser.get('http://www.baidu.com')
    time.sleep(1)
    elem = browser.find_element(By.NAME, 'wd')  # Find the search box
    elem.send_keys(keyword + Keys.RETURN)
    time.sleep(5)
    html = browser.page_source

    bs = BeautifulSoup(html, "html.parser")
    search_results = bs.find(name='div', attrs={'id': 'content_left'})
    texts = ""
    max_times = 8
    cnt = 0
    for search_result in search_results.contents:
        if type(search_result) is Tag and search_result.has_attr("id"):
            href = search_result.find(name='a')
            href = href.attrs['href']
            if href[0] == '/':
                href = "https://www.baidu.com" + href
            browser.get(href)
            time.sleep(1)
            bs_of_search_result = BeautifulSoup(browser.page_source, "html.parser")
            text = bs_of_search_result.find_all(text=[re.compile(keyword[i]) for i in range(len(keyword))])
            text = [check_information_validity(item) for item in text]
            text = "".join(text)
            texts += text
            cnt += 1
            if cnt >= max_times:
                break
    browser.quit()
    texts = texts.replace("\n", "")
    return texts


async def init_newbing():
    return await NewBing.create(cookie_path='cookies_newbing.json')


async def _ask_newbing(prompt: str, ip: str):
    chatbot = await init_newbing()
    if os.path.exists(f"stat_{ip}"):
        try:
            stat = load_variable(f"stat_{ip}")
            chatbot.chat_hub.request.client_id = stat.client_id
            chatbot.chat_hub.request.conversation_id = stat.conversation_id
            chatbot.chat_hub.request.conversation_signature = stat.conversation_signature
            chatbot.chat_hub.request.invocation_id = stat.invocation_id
        except:
            total_message = "【暂时无法连接NewBing，请稍后再试】"
            return total_message
    else:
        stat = Stat_Newbing()

    success = False
    try_times = 2
    total_message = ""
    while success is False:
        try:
            response = await chatbot.ask(prompt=prompt, conversation_style=ConversationStyle.creative,wss_link="wss://sydney.bing.com/sydney/ChatHub")
            await chatbot.close()
            try:
                total_message += response['item']['messages'][1]['text']+"\n" \
                                +"\n".join((f"[{i+1}]："+response['item']['messages'][1]['sourceAttributions'][i]['seeMoreUrl']+' '+response['item']['messages'][1]['sourceAttributions'][i]['providerDisplayName']) for i in range(len(response['item']['messages'][1]['sourceAttributions']))) +"\n" \
                                +"你可以继续问："+"【"+"】【".join(response['item']['messages'][1]['suggestedResponses'][i]['text'] for i in range(len(response['item']['messages'][1]['suggestedResponses'])))+"】"
                success = True
            except:
                try:
                    total_message += response['item']['messages'][1]['text']+"\n" \
                                    +"你可以继续问："+"【"+"】【".join(response['item']['messages'][1]['suggestedResponses'][i]['text'] for i in range(len(response['item']['messages'][1]['suggestedResponses'])))+"】"
                    success = True
                except:
                    try:
                        total_message += response['item']['messages'][1]['text']+"\n" \
                                        +"\n".join((f"[{i+1}]："+response['item']['messages'][1]['sourceAttributions'][i]['seeMoreUrl']+' '+response['item']['messages'][1]['sourceAttributions'][i]['providerDisplayName']) for i in range(len(response['item']['messages'][1]['sourceAttributions'])))
                        success = True
                    except:
                        try:
                            total_message += response['item']['messages'][1]['text']
                            success = True
                        except:
                            try_times -= 1
                            if try_times <= 0:
                                total_message = "【暂时无法连接NewBing，请稍后再试】"
                                if os.path.exists(f"stat_{ip}"):
                                    os.remove(f"stat_{ip}")
                                return total_message
                            total_message = "【上一个NewBing丢失连接，为您重新连接新的NewBing】"
                            chatbot = await init_newbing()
                            stat = Stat_Newbing()
                            success = False
        except Exception as result:
            try_times -= 1
            if try_times <= 0:
                total_message = "【暂时无法连接NewBing，请稍后再试】"
                if os.path.exists(f"stat_{ip}"):
                    os.remove(f"stat_{ip}")
                return total_message
            total_message = "【上一个NewBing丢失连接，为您重新连接新的NewBing】"
            chatbot = await init_newbing()
            stat = Stat_Newbing()
            success = False
    stat.cnt += 1
    stat.time = time.time()
    stat.client_id = chatbot.chat_hub.request.client_id
    stat.conversation_id = chatbot.chat_hub.request.conversation_id
    stat.conversation_signature = chatbot.chat_hub.request.conversation_signature
    stat.invocation_id = chatbot.chat_hub.request.invocation_id
    try:
        save_variable(stat, f"stat_{ip}")
        print(f"{stat.time}：用户{ip}正在进行第{stat.cnt}次对话，发送内容是【{prompt}】，回答内容是【{total_message}】")
    except:
        total_message = "【暂时无法连接NewBing，请稍后再试】"
        return total_message
    return total_message


async def ask_newbing(prompt: str, ip: str):
    result = await _ask_newbing(prompt, ip)
    return result
