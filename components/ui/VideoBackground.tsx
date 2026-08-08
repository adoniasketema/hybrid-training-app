import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
// @ts-ignore
import { Asset } from 'expo-asset';

interface VideoBackgroundProps {
  /** Pass require('@/assets/videos/...') */
  source: number;
  children?: React.ReactNode;
}

/**
 * Renders a seamless, fullscreen video background on Web using a raw <video> tag.
 * No controls, no play button — just a cinematic loop.
 * On native, falls back to a plain dark View.
 */
export function VideoBackground({ source, children }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUri, setVideoUri] = React.useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // On web, require() sometimes returns a string directly, or a module ID
      if (typeof source === 'string') {
        setVideoUri(source);
      } else {
        const asset = Asset.fromModule(source);
        if (asset?.uri) {
          setVideoUri(asset.uri);
        }
      }
    }
  }, [source]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    // Retry on the events that mean "playback is possible right now".
    // The `pause` handler covers browsers that pause a muted background
    // video when the tab loses visibility — resume as soon as we can.
    v.addEventListener('canplay', tryPlay);
    v.addEventListener('loadeddata', tryPlay);
    v.addEventListener('pause', tryPlay);
    const onVis = () => { if (!document.hidden) tryPlay(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      v.removeEventListener('canplay', tryPlay);
      v.removeEventListener('loadeddata', tryPlay);
      v.removeEventListener('pause', tryPlay);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [videoUri]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0A0A' }]} />
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {videoUri && (
          // @ts-ignore - react-native-web supports HTML elements
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              filter: 'brightness(1.6) contrast(1.1)',
              zIndex: 0,
            }}
          >
            <source src={videoUri} type="video/mp4" />
          </video>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
});
