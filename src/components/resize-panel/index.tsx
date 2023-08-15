import { CaretRightOutlined } from '@ant-design/icons';
import { Feature } from '@turf/turf';
import { useSize } from 'ahooks';
import classNames from 'classnames';
import { Resizable } from 're-resizable';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { RightPanelWidthRange } from '../../constants';
import { useFeature, useGlobal } from '../../recoil';
import useStyle from './styles';

export interface ResizePanelProps {
  left: ReactNode;
  right: ReactNode;
  onFeatureChange: (features: Feature[]) => void;
}

export const ResizePanel: React.FC<ResizePanelProps> = ({
  left,
  right,
  onFeatureChange,
}) => {
  const { hideEditor, setHideEditor, rightPanelWidth, setRightWidth } =
    useGlobal();
  const [resizePanel, setResizePanel] = useState<HTMLDivElement | null>(null);
  const [minRightWidth, maxRightWidth] = RightPanelWidthRange;
  const { width: containerWidth = 0 } = useSize(resizePanel) ?? {};
  const { features } = useFeature();
  const styles = useStyle();

  const onResize = (event: Event) => {
    const { left = 0 } = resizePanel?.getBoundingClientRect() ?? {};

    let rightPanelWidth =
      100 * (1 - ((event as MouseEvent).clientX - left) / containerWidth);
    if (rightPanelWidth < minRightWidth) {
      rightPanelWidth = minRightWidth;
    }
    if (rightPanelWidth > maxRightWidth) {
      rightPanelWidth = maxRightWidth;
    }
    setRightWidth(rightPanelWidth);
  };

  const calcRightWidth = useMemo(() => {
    return hideEditor ? 0 : rightPanelWidth;
  }, [hideEditor, rightPanelWidth]);

  useEffect(() => {
    onFeatureChange(features);
  }, [features]);

  return (
    <div
      className={classNames([styles.resizePanel, 'l7-editor-content'])}
      ref={(ref: HTMLDivElement) => {
        setResizePanel(ref);
      }}
    >
      <div
        className={classNames([
          styles.resizePanelLeft,
          'l7-editor-content__left',
        ])}
        style={{ width: `${100 - calcRightWidth}%` }}
      >
        {left}
      </div>
      <Resizable
        enable={{
          left: true,
        }}
        style={{
          marginLeft: `${100 - calcRightWidth}%`,
        }}
        size={{
          width: `${calcRightWidth}%`,
          height: '100%',
        }}
        minWidth={`${(minRightWidth / 100) * containerWidth}px`}
        maxWidth={`${(maxRightWidth / 100) * containerWidth}px`}
        className={classNames([
          styles.resizePanelRight,
          'l7-editor-content__right',
        ])}
        handleClasses={{
          left: styles.resizePanelDragLine,
        }}
        handleStyles={{
          left: { width: 6, left: -3 },
        }}
        defaultSize={{
          width: `${calcRightWidth}%`,
          height: '100%',
        }}
        onResize={onResize}
      >
        {right}
        <div
          className={styles.resizePanelToggleBtn}
          onClick={() => {
            setHideEditor(!hideEditor);
          }}
        >
          <CaretRightOutlined
            style={{
              transform: hideEditor ? 'rotate(-180deg)' : undefined,
            }}
          />
        </div>
      </Resizable>
    </div>
  );
};
