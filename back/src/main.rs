use warp::Filter;
use std::env;
use serde_json::{json, Value};
use std::collections::HashMap;
use ipconfig::OperStatus;
use sysinfo::{NetworkExt, NetworksExt, ProcessExt, System, SystemExt, DiskExt, ComponentExt, CpuExt};
use chatgpt::prelude::*;
use pyo3::{prelude::*, types::{IntoPyDict, PyModule}};
use warp::http::HeaderName;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use sha256::digest;


#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct ChatGPT {
    pub message: String,
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct Request {
    pub url: String,
}

async fn fun_ipaddress() -> Result<warp::reply::Json, warp::Rejection> {
    let mut ipv4 = Vec::new();
    let mut ipv6 = Vec::new();
    if let Ok(adapters) = ipconfig::get_adapters() {
        for adapter in adapters{
            if !adapter.gateways().is_empty() && adapter.oper_status() == OperStatus::IfOperStatusUp {
                let ips = adapter.ip_addresses();
                for ip in ips {
                    if ip.is_ipv4() {
                        ipv4.push(ip.clone());
                    }
                    if ip.is_ipv6() {
                        ipv6.push(ip.clone());
                    }
                }
                break;
            }
        }
    }
    let sth = json!({"ipv4":ipv4, "ipv6":ipv6}); // 创造serde_json变量（类型叫Value）
    let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
    Ok(sth_warp)
}

async fn fun_pcmonitor() -> Result<warp::reply::Json, warp::Rejection> {
    let mut sys = System::new_all();

    // First we update all information of our `System` struct.
    sys.refresh_all();

    // We display all disks' information:
    let mut disks = Vec::new();
    for disk in sys.disks() {
        disks.push(json!({
            "name":format!("{:?}",disk.name()),
            "available_space(MB)":disk.available_space()/1000000,
            "total_space(MB)":disk.total_space()/1000000
        }));
    }

    // Network interfaces name, data received and data transmitted:
    let mut networks = Vec::new();
    for (interface_name, data) in sys.networks() {
        networks.push(json!({
            "interface_name":interface_name,
            "received(MB/s)":data.received()/100000,
            "transmitted(MB/s)":data.transmitted()/100000
        }));
    }

    // CPU temperature:
    let mut cpus = Vec::new();
    for processor in sys.cpus() {
        cpus.push(json!({
            "brand":processor.brand(),
            "name":processor.name(),
            "freq":processor.frequency(),
            "usage":(processor.cpu_usage()/10.0) as u32
        }));
    }


    // Components temperature:
    let mut components = Vec::new();
    for component in sys.components() {
        components.push(json!({
            "label":component.label(),
            "temperature":component.temperature() as u32
        }));
    }

    let memory = json!({
        "total_memory(MB)":sys.total_memory()/1000000,
        "used_memory(MB)":sys.used_memory()/1000000,
        "total_swap(MB)":sys.total_swap()/1000000,
        "used_swap(MB)":sys.used_swap()/1000000
    });

// Display system information:
    let system = json!({
        "system_name":sys.name(),
        "system_os_version":sys.os_version()
    });

// Display processes ID, name na disk usage:
    let mut processes = Vec::new();
    for (pid, process) in sys.processes() {
        if process.cpu_usage() > 0.0 {
            processes.push(json!({
                "exe":process.exe(),
                "cpu_usage": (process.cpu_usage()/10.0) as u32,
                "memory": process.memory()/1000000
            }));
        }
    }


    let sth = json!({
        "cpus":cpus,
        "disks":disks,
        "networks":networks,
        "components":components,
        "memory":memory,
        "system":system,
        "processes":processes}); // 创造serde_json变量（类型叫Value）
    let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
    Ok(sth_warp)
}


async fn fun_chatgpt(message: ChatGPT, address: Option<SocketAddr>) -> Result<warp::reply::Json, warp::Rejection> {
    let gil = Python::acquire_gil();
    let py = gil.python();
    let code = include_str!("main.py");
    if let Some(ip) = address {
        if let Ok(main) = PyModule::from_code(py, code, "main.py", "main") {
            if let Ok(fun) = main.getattr("ask") {
                if let Ok(result) = fun.call1((message.message, digest(ip.to_string()),)) {
                    if let Ok(text) = result.extract::<String>() {
                        let sth = json!({"text":text}); // 创造serde_json变量（类型叫Value）
                        let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
                        return Ok(sth_warp);
                    }
                    let sth = json!({"text":"extract出错"}); // 创造serde_json变量（类型叫Value）
                    let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
                    return Ok(sth_warp);
                }
                let sth = json!({"text":"call出错"}); // 创造serde_json变量（类型叫Value）
                let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
                return Ok(sth_warp);
            }
            let sth = json!({"text":"get出错"}); // 创造serde_json变量（类型叫Value）
            let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
            return Ok(sth_warp);
        }
        let sth = json!({"text":"code出错"}); // 创造serde_json变量（类型叫Value）
        let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
        return Ok(sth_warp);
    }
    let sth = json!({"text":"无法获取ip地址"}); // 创造serde_json变量（类型叫Value）
    let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
    return Ok(sth_warp);
}

async fn fun_request(url: Request) -> Result<warp::reply::Json, warp::Rejection> {
    let gil = Python::acquire_gil();
    let py = gil.python();
    let code = include_str!("main.py");

    if let Ok(main) = PyModule::from_code(py, code, "main.py", "main") {
        if let Ok(fun) = main.getattr("get_response") {
            if let Ok(result) = fun.call1((url.url,)) {
                if let Ok(text) = result.extract::<String>() {
                    let sth = json!({"json":text}); // 创造serde_json变量（类型叫Value）
                    let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
                    return Ok(sth_warp);
                }
                let sth = json!({"json":"extract出错"}); // 创造serde_json变量（类型叫Value）
                let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
                return Ok(sth_warp);
            }
            let sth = json!({"json":"call出错"}); // 创造serde_json变量（类型叫Value）
            let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
            return Ok(sth_warp);
        }
        let sth = json!({"json":"get出错"}); // 创造serde_json变量（类型叫Value）
        let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
        return Ok(sth_warp);
    }
    let sth = json!({"json":"code出错"}); // 创造serde_json变量（类型叫Value）
    let sth_warp = warp::reply::json(&sth); // 转换为warp的json格式
    return Ok(sth_warp);

}


#[tokio::main]
async fn main() {
    env::set_var("RUST_APP_LOG", "debug"); // 设置一个全局变量的值（开发时建议是debug，上线后建议是info），这个值表示logger的最高输出信息级别
    pretty_env_logger::init_custom_env("RUST_APP_LOG"); // 根据全局变量的值设置logger的最高信息级别
    let info_log = warp::log("info_log"); // 使具体的filter在logger中输出info信息

    let cors = warp::cors()
        .allow_any_origin()
        .allow_credentials(true)
        .allow_headers(vec!["access-control-allow-origin", "content-type"])
        .allow_methods(vec!["POST", "GET", "PUT", "DELETE"]);

    // API1：服务器IP地址获取
    // url:./tools/ipaddress
    // 参数：无
    // 返回：{"ipv4":[字符串], "ipv6":[字符串]}
    let ipaddress = warp::get()
        .and(warp::path("tools"))
        .and(warp::path("ipaddress"))
        .and(warp::path::end())
        .and_then(fun_ipaddress);

    // API2：服务器状态监控
    // url:./tools/pcmonitor
    // 参数：无
    // 返回：{"disks":[{}], "networks":[{}], "components":[{}], "memory":{},"system":{},"processes":[{}]}
    let pcmonitor = warp::get()
        .and(warp::path("tools"))
        .and(warp::path("pcmonitor"))
        .and(warp::path::end())
        .and_then(fun_pcmonitor);

    // API3：ChatGPT
    // url:./tools/chatgpt
    // 参数：{"message":字符串}
    // 返回：{"text":字符串}
    let chatgpt = warp::post()
        .and(warp::path("tools"))
        .and(warp::path("chatgpt"))
        .and(warp::path::end())
        .and(warp::body::json::<ChatGPT>())
        .and(warp::filters::addr::remote())
        .and_then(fun_chatgpt);

    // API4：request
    // url:./tools/request
    // 参数：{"url":字符串}
    // 返回：{"json":字符串}
    let request = warp::post()
        .and(warp::path("tools"))
        .and(warp::path("request"))
        .and(warp::path::end())
        .and(warp::body::json::<Request>())
        .and_then(fun_request);

    let sum = ipaddress.or(pcmonitor).or(chatgpt).or(request).with(info_log).with(cors);

    // let url = [127, 0, 0, 1]; //调试
    let url = [0, 0, 0, 0, 0, 0, 0, 0]; //部署
    warp::serve(sum)
        .run((url, 3001)) // 部署时改为[0, 0, 0, 0, 0, 0, 0, 0]
        .await; // 阻塞运行
}