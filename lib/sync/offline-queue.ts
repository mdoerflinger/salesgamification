/**
 * IndexedDB-based offline queue for mutations.
 * Stores pending create/update/delete operations when offline.
 */
import type { SyncQueueItem } from '@/types'

const DB_NAME = 'sales-lead-coach-sync'
const DB_VERSION = 1
const STORE_NAME = 'sync-queue'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available on the server'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const offlineQueue = {
  /**
   * Add a mutation to the offline queue.
   */
  async enqueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<SyncQueueItem> {
    const db = await openDB()
    const queueItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.add(queueItem)
      request.onsuccess = () => resolve(queueItem)
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Get all pending items from the queue.
   */
  async getPending(): Promise<SyncQueueItem[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('status')
      const request = index.getAll('pending')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Update item status.
   */
  async updateStatus(id: string, status: SyncQueueItem['status'], retries?: number): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.status = status
          if (retries !== undefined) item.retries = retries
          store.put(item)
        }
        resolve()
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  },

  /**
   * Remove completed items from the queue.
   */
  async clearCompleted(): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('status')
      const request = index.openCursor('completed')
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Get queue size.
   */
  async getCount(): Promise<number> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },
}
