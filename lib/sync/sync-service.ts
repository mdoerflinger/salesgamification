/**
 * Sync service interface for pull/push/conflict resolution.
 * Designed to later integrate with Dataverse Change Tracking delta links.
 */
import type { ConflictResolution } from '@/types'

export interface SyncService {
  /**
   * Pull latest changes from the server.
   * Future: use Dataverse Change Tracking delta links.
   */
  pull(): Promise<void>

  /**
   * Push queued offline mutations to the server.
   */
  push(): Promise<{ succeeded: number; failed: number }>

  /**
   * Resolve a conflict between local and server data.
   */
  resolveConflict(
    localData: unknown,
    serverData: unknown,
    strategy: ConflictResolution
  ): unknown
}

/**
 * Default sync service implementation with last-write-wins strategy.
 */
export class DefaultSyncService implements SyncService {
  async pull(): Promise<void> {
    // Stub: In production, use Dataverse Change Tracking delta links
    // to fetch only changed records since last sync
  }

  async push(): Promise<{ succeeded: number; failed: number }> {
    // Stub: Replay offline queue items via DataverseClient
    // See offline-queue.ts for queue management
    return { succeeded: 0, failed: 0 }
  }

  resolveConflict(
    localData: unknown,
    _serverData: unknown,
    strategy: ConflictResolution
  ): unknown {
    switch (strategy) {
      case 'client_wins':
        return localData
      case 'server_wins':
        return _serverData
      case 'manual':
        // In a real app, surface UI for manual resolution
        return localData
      default:
        return localData
    }
  }
}
