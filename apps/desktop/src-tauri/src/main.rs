#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "windows")]
use tauri::Manager;

#[cfg(target_os = "windows")]
fn fit_window_to_work_area(window: &tauri::WebviewWindow) -> tauri::Result<()> {
    let monitor = match window.current_monitor()? {
        Some(monitor) => Some(monitor),
        None => window.primary_monitor()?,
    };
    if let Some(monitor) = monitor {
        let area = monitor.work_area();
        let scale = monitor.scale_factor();
        let outer = window.outer_size()?;
        let inner = window.inner_size()?;
        let border_width = outer.width.saturating_sub(inner.width);
        let border_height = outer.height.saturating_sub(inner.height);
        let available_width = ((area.size.width.saturating_sub(border_width)) as f64 / scale - 24.0).max(1.0);
        let available_height = ((area.size.height.saturating_sub(border_height)) as f64 / scale - 24.0).max(1.0);
        let width = available_width.min(1440.0);
        let height = available_height.min(960.0);
        window.set_min_size(Some(tauri::LogicalSize::new(320.0_f64.min(width), 240.0_f64.min(height))))?;
        window.set_size(tauri::LogicalSize::new(width, height))?;
        let outer_width = (width * scale).round() as u32 + border_width;
        let outer_height = (height * scale).round() as u32 + border_height;
        window.set_position(tauri::PhysicalPosition::new(
            area.position.x + (area.size.width.saturating_sub(outer_width) / 2) as i32,
            area.position.y + (area.size.height.saturating_sub(outer_height) / 2) as i32,
        ))?;
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "windows")]
            if let Some(window) = app.get_webview_window("main") {
                // Best-effort OS sizing must not prevent app startup if monitor APIs fail.
                if let Err(error) = fit_window_to_work_area(&window) {
                    eprintln!("Initial window sizing unavailable: {error}");
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Marine Tools Preview could not start");
}
