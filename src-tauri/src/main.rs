#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use hyper::header::{HeaderValue, CONTENT_TYPE};
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server, Uri};
use hyper_tls::HttpsConnector; // 新增的 HTTPS 连接器
use std::convert::Infallible;
use tauri::generate_context;

async fn proxy(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let target_host = "https://data.chiven.net";
    let uri_str = format!("{}{}", target_host, req.uri());
    let uri: Uri = uri_str.parse().expect("Failed to parse URI");

    // println!("Forwarding request to: {}", uri);
    // println!("Request Headers: {:?}", req.headers());

    let mut new_request = Request::builder()
        .method(req.method())
        .uri(uri)
        .header(
            "User-Agent",
            req.headers()
                .get("User-Agent")
                .unwrap_or(&HeaderValue::from_static("Mozilla/5.0"))
                .clone(),
        )
        .header("Referer", "https://data.chiven.net/")
        .header("Origin", target_host)
        .header("Host", "tptsit.itaiping.com")
        .header("Accept", "*/*");

    // 检查并添加 Authorization 头部
    if let Some(auth_header) = req.headers().get("Authorization") {
        new_request = new_request.header("Authorization", auth_header.clone());
    }

    // 处理请求体
    let body_bytes = hyper::body::to_bytes(req.into_body())
        .await
        .expect("Failed to read request body");
    // println!("Request Body: {:?}", String::from_utf8_lossy(&body_bytes));
    let new_request = new_request
        .body(body_bytes.into())
        .expect("Failed to build request");

    // 创建 HTTPS 客户端
    let https = HttpsConnector::new();
    let client = hyper::Client::builder().build::<_, hyper::Body>(https);

    match client.request(new_request).await {
        Ok(response) => {
            // println!("Received response: {} {:?}", response.status(), response.headers());

            let status = response.status();
            let headers = response.headers().clone();
            let body_bytes = hyper::body::to_bytes(response.into_body())
                .await
                .expect("Failed to read response body");

            // 构建新的响应
            let mut new_response = Response::new(body_bytes.into());
            *new_response.status_mut() = status;

            // 确保 Content-Type 是正确的
            if let Some(content_type) = headers.get(CONTENT_TYPE) {
                new_response
                    .headers_mut()
                    .insert(CONTENT_TYPE, content_type.clone());
            } else {
                new_response
                    .headers_mut()
                    .insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
            }

            // 复制其他头部
            for (key, value) in headers.iter() {
                new_response
                    .headers_mut()
                    .insert(key.clone(), value.clone());
            }

            Ok(new_response)
        }
        Err(err) => {
            eprintln!("Failed to proxy request: {:?}", err);
            Ok(Response::new(Body::from("Proxy error")))
        }
    }
}

#[tokio::main]
async fn main() {
    let make_svc = make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(proxy)) });
    let addr = ([127, 0, 0, 1], 6060).into(); // 监听6060端口

    let server = Server::bind(&addr).serve(make_svc);

    tokio::spawn(async move {
        println!("Proxy server is starting on http://{}", addr);
        if let Err(e) = server.await {
            eprintln!("Server error: {}", e);
        } else {
            println!("Proxy server started successfully on http://{}", addr);
        }
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .run(generate_context!())
        .expect("error while running tauri application");
}
