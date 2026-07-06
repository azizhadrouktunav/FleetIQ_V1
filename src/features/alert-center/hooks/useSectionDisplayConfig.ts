import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSectionId } from '../constants/alert-config-sections';
import {
  buildAllDefaultSectionDisplayConfigs,
  buildDefaultSectionDisplayConfig,
  getVisibleAlertTypesForSection,
  loadAllSectionDisplayConfigs,
  persistAllSectionDisplayConfigs,
  reorderSectionItems,
  type AllSectionsDisplayConfig,
  type SectionDisplayConfig,
} from '../constants/section-display-config';

let sharedConfig: AllSectionsDisplayConfig = loadAllSectionDisplayConfigs();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AllSectionsDisplayConfig {
  return sharedConfig;
}

function updateSharedConfig(updater: (prev: AllSectionsDisplayConfig) => AllSectionsDisplayConfig) {
  sharedConfig = updater(sharedConfig);
  persistAllSectionDisplayConfigs(sharedConfig);
  listeners.forEach((listener) => listener());
}

export function useSectionDisplayConfig(sectionId: AlertCenterSectionId) {
  const allConfig = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const config = useMemo(
    () => allConfig[sectionId] ?? buildDefaultSectionDisplayConfig(sectionId),
    [allConfig, sectionId]
  );

  const visibleAlertTypes = useMemo(
    () => getVisibleAlertTypesForSection(config),
    [config]
  );

  const saveSectionConfig = useCallback(
    (next: SectionDisplayConfig) => {
      const withTimestamp = { ...next, updatedAt: new Date().toISOString() };
      updateSharedConfig((prev) => ({
        ...prev,
        [sectionId]: withTimestamp,
      }));
    },
    [sectionId]
  );

  const setItemVisible = useCallback(
    (alertType: AlertType, visible: boolean) => {
      saveSectionConfig({
        ...config,
        items: config.items.map((item) =>
          item.alertType === alertType ? { ...item, visible } : item
        ),
      });
    },
    [config, saveSectionConfig]
  );

  const moveItem = useCallback(
    (alertType: AlertType, direction: 'up' | 'down') => {
      saveSectionConfig({
        ...config,
        items: reorderSectionItems(config.items, alertType, direction),
      });
    },
    [config, saveSectionConfig]
  );

  const resetToDefaults = useCallback(() => {
    saveSectionConfig(buildDefaultSectionDisplayConfig(sectionId));
  }, [sectionId, saveSectionConfig]);

  return {
    config,
    visibleAlertTypes,
    setItemVisible,
    moveItem,
    resetToDefaults,
  };
}

export function resetAllSectionDisplayConfigs(): void {
  updateSharedConfig(() => buildAllDefaultSectionDisplayConfigs());
}
