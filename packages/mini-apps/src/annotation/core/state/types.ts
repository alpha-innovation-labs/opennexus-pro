export interface AnnotationsDaemonState {
  pid: number;
  startedAt: string;
}

export interface AnnotationsDaemonHeartbeat {
  pid: number;
  updatedAt: string;
}

export interface AnnotationsDaemonStatus {
  running: boolean;
  pid?: number;
  startedAt?: string;
  heartbeatAt?: string;
}
