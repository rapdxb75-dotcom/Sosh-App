import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G, Mask, Rect } from 'react-native-svg';

export const ProTierIcon = ({ size = 24 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          {/* Main Blue Gradient */}
          <LinearGradient id="proGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1e40af" stopOpacity="1" />
          </LinearGradient>
          
          {/* Shine Gradient */}
          <LinearGradient id="proShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>

          {/* Glow effect simulated with multiple stops */}
          <LinearGradient id="proGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Outer Glow */}
        <Circle cx="12" cy="12" r="12" fill="url(#proGlow)" />

        {/* Main Bolt Shape */}
        <Path
          d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
          fill="url(#proGradMain)"
          stroke="#3b82f6"
          strokeWidth="0.5"
        />

        {/* Internal Shading for Depth */}
        <Path
          d="M13 2L12 10H20L11 22L12 14H4L13 2Z"
          fill="rgba(255, 255, 255, 0.1)"
        />

        {/* Sharp Shine highlight */}
        <Path
          d="M13 2L12.2 8H17L11.5 15L12 14H6L13 2Z"
          fill="url(#proShine)"
          opacity="0.3"
        />
      </Svg>
    </View>
  );
};

export const BusinessTierIcon = ({ size = 24 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          {/* Main Orange Gradient */}
          <LinearGradient id="bizGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF8A00" stopOpacity="1" />
            <Stop offset="100%" stopColor="#B45309" stopOpacity="1" />
          </LinearGradient>

          {/* Contrast Highlight */}
          <LinearGradient id="bizHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>

          {/* Glow Base */}
          <LinearGradient id="bizGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF8A00" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#FF8A00" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Outer Glow */}
        <Circle cx="12" cy="12" r="12" fill="url(#bizGlow)" />

        {/* Rocket Body */}
        <G transform="translate(4, 2)">
          <Path
            d="M8 0C8 0 4 4 4 9C4 13 6 15 8 16C10 15 12 13 12 9C12 4 8 0 8 0Z"
            fill="url(#bizGradMain)"
          />
          
          {/* Fins */}
          <Path
            d="M4 11C2 12 0 16 0 16L4 15V11Z"
            fill="#B45309"
          />
          <Path
            d="M12 11C14 12 16 16 16 16L12 15V11Z"
            fill="#B45309"
          />
          
          {/* Bottom Engine Exhaust Placeholder */}
          <Path
            d="M7 16H9L8 19L7 16Z"
            fill="#FF4D00"
          />

          {/* Shine on body */}
          <Path
            d="M8 1C8 1 5 4.5 5 9C5 12 6 14 8 15V1Z"
            fill="url(#bizHighlight)"
            opacity="0.4"
          />
        </G>

        {/* Window/Portal on Rocket */}
        <Circle cx="12" cy="10" r="1.5" fill="rgba(255, 255, 255, 0.8)" />
      </Svg>
    </View>
  );
};
