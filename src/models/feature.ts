import { FeatureKey, LocalstorageKey } from '@/constants';
import { FilterField } from '@/types/filter';
import { transformFeatures } from '@/utils';
import { prettierText } from '@/utils/prettier-text';
import { Scene } from '@antv/l7';
import {
  bbox,
  Feature,
  featureCollection,
  Geometry,
  GeometryCollection,
  getType,
} from '@turf/turf';
import { useLocalStorageState } from 'ahooks';
import { message } from 'antd';
import { flatMap, max, min } from 'lodash';
import { useMemo, useState } from 'react';

export default () => {
  const [scene, setScene] = useState<Scene | null>(null);

  const [editorText, setEditorText] = useLocalStorageState(
    LocalstorageKey.EditorText,
    {
      defaultValue: JSON.stringify(
        { type: 'FeatureCollection', features: [] },
        null,
        2,
      ),
    },
  );
  const [savedText, setSavedText] = useState('');
  const [features, _setFeatures] = useState<
    Feature<
      Geometry | GeometryCollection,
      {
        // @ts-ignore
        [FeatureKey.Index]: number;
      }
    >[]
  >([]);

  const [isDraw, setIsDraw] = useState(false);

  const setFeatures = (features: Feature[]) => {
    _setFeatures(
      // @ts-ignore
      features.map((feature, featureIndex) => {
        feature.properties = {
          ...feature.properties,
          [FeatureKey.Index]: featureIndex,
        };
        // @ts-ignore
        if (!feature.properties?.[FeatureKey.DrawType]) {
          // @ts-ignore
          feature.properties[FeatureKey.DrawType] = (() => {
            const type = getType(feature);
            if (/Point/.test(type)) {
              return 'point';
            }
            if (/LineString/.test(type)) {
              return 'line';
            }
            return 'polygon';
          })();
        }
        return feature;
      }),
    );
  };

  const savable = useMemo(() => {
    return editorText !== savedText;
  }, [editorText, savedText]);

  const saveEditorText = (value?: string) => {
    const emptyFeatures = JSON.stringify(
      { type: 'FeatureCollection', features: [] },
      null,
      2,
    );
    let features: Feature[] = [];
    if (editorText || value) {
      try {
        features = transformFeatures(value ?? editorText);
        if (value) {
          setEditorText(value);
        }
        setSavedText(value ?? editorText);
        setFeatures(features);
      } catch (e) {
        message.warn('数据加载有误');
      }
    } else {
      setEditorText(emptyFeatures);
      setSavedText(emptyFeatures);
    }
    return features;
  };

  const resetFeatures = (newFeatures: Feature[]) => {
    const newText = prettierText({ content: featureCollection(newFeatures) });
    setEditorText(newText);
    setSavedText(newText);
    setFeatures(newFeatures);
  };

  const dataSource = useMemo(() => {
    const data: Record<string, string | number>[] = features.map(
      (item, index) => {
        const { properties } = item;
        return { __index: index + 1, ...properties };
      },
    );
    const featureKeyList: FilterField[] = [];
    Array.from(
      new Set(
        flatMap(features.map(({ properties }) => Object.keys(properties))),
      ),
    ).forEach((field: string) => {
      const type = typeof data[0][field];
      if (type === 'string' || type === 'boolean') {
        const value = data.map((item) => String(item[field])) as string[];
        featureKeyList.push({ type: 'string', field, value });
      } else if (type === 'number') {
        const value = data.map((item) => item[field]);
        featureKeyList.push({
          type,
          field,
          min: min(value) as number,
          max: max(value) as number,
        });
      }
    });
    return featureKeyList;
  }, [features]);

  const bboxAutoFit = (currentFeatures?: Feature[]) => {
    const realFeatures = currentFeatures ?? features;
    if (scene && realFeatures.length) {
      const [lng1, lat1, lng2, lat2] = bbox(featureCollection(realFeatures));
      scene.fitBounds([
        [lng1, lat1],
        [lng2, lat2],
      ]);
    }
  };

  return {
    editorText,
    setEditorText,
    savedText,
    setSavedText,
    features,
    setFeatures,
    savable,
    saveEditorText,
    resetFeatures,
    dataSource,
    bboxAutoFit,
    setScene,
    scene,
    isDraw,
    setIsDraw,
  };
};
