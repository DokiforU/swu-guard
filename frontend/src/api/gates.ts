import { request } from "./http";
import type { GateOut } from "./types";

export const gatesApi = {
  list(params: { campus?: string; status_?: string; direction?: string } = {}) {
    return request<GateOut[]>({ url: "/gates", method: "GET", params });
  },
  get(id: number) {
    return request<GateOut>({ url: `/gates/${id}`, method: "GET" });
  },
  publicList() {
    return request<GateOut[]>({ url: "/gates", method: "GET", skipAuth: true });
  },
  publicGet(id: number) {
    return request<GateOut>({ url: `/gates/${id}`, method: "GET", skipAuth: true });
  },
  create(data: Record<string, unknown>) {
    return request<GateOut>({ url: "/gates", method: "POST", data });
  },
  update(id: number, data: Record<string, unknown>) {
    return request<GateOut>({ url: `/gates/${id}`, method: "PUT", data });
  },
  setStatus(id: number, status: "online" | "offline" | "disabled") {
    return request<GateOut>({
      url: `/gates/${id}/status`,
      method: "PUT",
      data: { status },
    });
  },
  remove(id: number) {
    return request<{ ok: boolean }>({ url: `/gates/${id}`, method: "DELETE" });
  },
};
