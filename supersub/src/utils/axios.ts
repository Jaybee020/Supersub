import axios from "axios";

axios.defaults.baseURL = "https://supersub-server.fly.dev";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
