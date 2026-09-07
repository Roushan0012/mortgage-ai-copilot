export * from "./types";
export * from "./integration-manager";
export * from "./crm/mock-crm";
export * from "./crm/crm-adapter";
export * from "./los/mock-los";
export * from "./los/los-adapter";
export * from "./documents/mock-document-system";
export * from "./documents/document-adapter";
export * from "./communications/mock-communication";
export * from "./communications/communication-adapter";

import { IntegrationEvent } from "@/types";

export interface SyncResult {
  success: boolean;
  event: IntegrationEvent;
  externalRecordId: string;
}
