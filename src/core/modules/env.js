
export default class Env {
    static isTauri = window.__TAURI__ !== undefined ? true : false;
}