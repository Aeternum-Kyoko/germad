import worker from '../worker/index.js';
export default {fetch(request){const url=new URL(request.url);url.pathname='/api/supported-domains';return worker.fetch(new Request(url));}};
