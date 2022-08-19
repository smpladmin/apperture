import { http, privateHttp } from "../http"

export const getTests = (): Promise<Array<{id: string; name: string}>> => {
  return privateHttp.get('/test').then(res => res.data);
}

export const getTestsV2 = (): Promise<Array<{id: string; name: string}>> => {
  console.log("called now");
  return http.get('/test').then(res => res.data);
}
