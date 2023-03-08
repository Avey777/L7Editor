import { LocalstorageKey, PrimaryColor } from '@/constants';
import { LarkMapProps } from '@antv/larkmap';
import { useLocalStorageState } from 'ahooks';

type MapOptions = LarkMapProps['mapOptions'];

export default () => {
  const [rightWidth, setRightWidth] = useLocalStorageState(
    LocalstorageKey.RightPanelWidth,
    {
      defaultValue: 50,
    },
  );
  const [mapOptions, setMapOptions] = useLocalStorageState<MapOptions>(
    LocalstorageKey.MapOptions,
    {
      defaultValue: {
        style: 'normal',
      },
    },
  );
  const [layerColor, setLayerColor] = useLocalStorageState(
    LocalstorageKey.LayerColor,
    {
      defaultValue: PrimaryColor,
    },
  );
  const [hideEditor, setHideEditor] = useLocalStorageState(
    LocalstorageKey.HideEditor,
    {
      defaultValue: false,
    },
  );

  return {
    rightWidth,
    setRightWidth,
    mapOptions,
    setMapOptions,
    layerColor,
    setLayerColor,
    hideEditor,
    setHideEditor,
  };
};
