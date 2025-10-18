import { useCallback, useRef, useState } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { useClickOutside } from '../hooks';
import styled from 'styled-components';
import type { vec3 } from 'gl-matrix';

const RowContainer = styled.div`
  position: relative;
`;

const Swatch = styled.div`
  width: 20px;
  height: 20px;
  border: 1px solid #fff;
  cursor: pointer;
`;

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  z-index: 1000;
`;

export const DebugPanelColorPickerRow = ({
  color,
  onChange,
}: {
  color: vec3;
  onChange: (color: vec3) => void;
}) => {
  const popover = useRef<HTMLDivElement>(null);
  const [isOpen, toggle] = useState(false);

  const [selectedColor, setSelectedColor] = useState(color);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <RowContainer>
      <Swatch
        style={{
          backgroundColor: `rgba(${color[0] * 255}, ${color[1] * 255}, ${
            color[2] * 255
          }, 1)`,
        }}
        onClick={() => toggle(true)}
      />
      {isOpen && (
        <Popover ref={popover}>
          <RgbColorPicker
            color={{
              r: selectedColor[0] * 255,
              g: selectedColor[1] * 255,
              b: selectedColor[2] * 255,
            }}
            onChange={(color) => {
              setSelectedColor([color.r / 255, color.g / 255, color.b / 255]);
              onChange([color.r / 255, color.g / 255, color.b / 255]);
            }}
          />
        </Popover>
      )}
    </RowContainer>
  );
};
