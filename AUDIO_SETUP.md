# Audio Setup - Transport Master

## 🎵 Background Music

### Implementation
Background music has been added to both the main menu and gameplay using `/public/music/track1.mp3`.

### Volume Levels
- **Main Menu:** 50% volume (0.5)
- **Gameplay:** 30% volume (0.3) - Lower to not distract from gameplay

### Technical Details
- **Loop:** Continuous playback
- **Autoplay:** Attempts to play on mount, gracefully handles browser autoplay restrictions
- **Cleanup:** Properly stops and cleans up audio on component unmount
- **Format:** MP3 (widely supported)

### Files Modified
1. `src/components/MainMenu.tsx`
   - Added `useRef` and `useEffect` for audio management
   - Volume: 0.5 (50%)
   
2. `src/components/GameUI.tsx`
   - Added `useRef` and `useEffect` for audio management
   - Volume: 0.3 (30%)

---

## 🔊 Sound Effects (Planned)

### Recommended Structure
```
/public/
  /music/
    track1.mp3 ✅ (implemented)
    track2.mp3 (optional alternative)
  /sounds/
    /ui/
      click.mp3
      hover.mp3
      success.mp3
      error.mp3
      notification.mp3
    /transport/
      metro_arrive.mp3
      metro_depart.mp3
      train_horn.mp3
      bus_door.mp3
      tram_bell.mp3
    /city/
      ambient_traffic.mp3
      ambient_crowd.mp3
      construction.mp3
      rain.mp3
```

### Suggested Sound Effects

#### UI Sounds
- **Button Click** - Sharp, satisfying click
- **Button Hover** - Subtle whoosh
- **Success** - Positive chime (line created, upgrade complete)
- **Error** - Negative buzz (insufficient funds)
- **Notification** - Gentle ping (toast appears)
- **Menu Open/Close** - Smooth transition sound

#### Transport Sounds
- **Metro Arrive** - Whoosh + brake screech
- **Metro Depart** - Door close + acceleration
- **Train Horn** - Classic train horn
- **Bus Door** - Pneumatic door hiss
- **Tram Bell** - Ding ding
- **Station Announcement** - Muffled PA system

#### City Ambience
- **Traffic** - Distant car sounds, horns
- **Crowd** - Murmur of people
- **Construction** - Drilling, hammering (when building)
- **Rain** - Light rain (weather system)
- **Wind** - Gentle breeze
- **Birds** - Morning ambience

---

## 🎮 Implementation Guide

### Adding UI Sound Effects

```typescript
// Create a sound utility hook
// src/hooks/useSound.ts

import { useRef } from 'react'

export const useSound = () => {
  const playSound = (soundPath: string, volume = 0.5) => {
    const audio = new Audio(soundPath)
    audio.volume = volume
    audio.play().catch(err => console.log('Sound play prevented:', err))
  }

  return { playSound }
}

// Usage in components
const { playSound } = useSound()

<button onClick={() => {
  playSound('/sounds/ui/click.mp3', 0.3)
  // ... rest of button logic
}}>
  Click Me
</button>
```

### Adding Ambient City Sounds

```typescript
// In GameUI.tsx, add ambient layer
useEffect(() => {
  const ambientAudio = new Audio('/sounds/city/ambient_traffic.mp3')
  ambientAudio.loop = true
  ambientAudio.volume = 0.15 // Very subtle
  ambientAudio.play().catch(err => console.log('Ambient prevented:', err))

  return () => {
    ambientAudio.pause()
  }
}, [])
```

### Adding Transport Sounds

```typescript
// When a vehicle arrives at a station
const playVehicleSound = (type: TransportType) => {
  const sounds = {
    metro: '/sounds/transport/metro_arrive.mp3',
    train: '/sounds/transport/train_horn.mp3',
    tram: '/sounds/transport/tram_bell.mp3',
    bus: '/sounds/transport/bus_door.mp3',
  }
  
  const audio = new Audio(sounds[type])
  audio.volume = 0.4
  audio.play().catch(err => console.log('Sound prevented:', err))
}
```

---

## 🎛️ Volume Control (Future Feature)

### Settings Panel Integration

```typescript
interface AudioSettings {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  ambientVolume: number
  muted: boolean
}

// Store in localStorage
const audioSettings = {
  masterVolume: 1.0,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  ambientVolume: 0.3,
  muted: false,
}

// Apply to all audio
audio.volume = baseVolume * audioSettings.masterVolume * audioSettings.musicVolume
```

---

## 📝 Best Practices

### Performance
- ✅ Preload frequently used sounds
- ✅ Use audio sprites for UI sounds (combine multiple sounds into one file)
- ✅ Limit concurrent sounds (max 3-5 at once)
- ✅ Use Web Audio API for complex scenarios

### User Experience
- ✅ Always provide mute option
- ✅ Respect browser autoplay policies
- ✅ Fade in/out music transitions
- ✅ Duck music volume when important sounds play
- ✅ Spatial audio for 3D map (left/right panning)

### File Formats
- **Primary:** MP3 (best compatibility)
- **Alternative:** OGG (smaller file size)
- **Fallback:** WAV (uncompressed, larger)

### File Size Guidelines
- **Music:** 2-5 MB per track (compressed)
- **Sound Effects:** 10-50 KB each
- **Ambient:** 500 KB - 1 MB (loopable)

---

## 🎼 Music Transitions

### Smooth Crossfade Between Menu and Game

```typescript
// Fade out menu music, fade in game music
const fadeOut = (audio: HTMLAudioElement, duration = 1000) => {
  const steps = 20
  const stepTime = duration / steps
  const volumeStep = audio.volume / steps
  
  const interval = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - volumeStep)
    if (audio.volume === 0) {
      clearInterval(interval)
      audio.pause()
    }
  }, stepTime)
}

const fadeIn = (audio: HTMLAudioElement, targetVolume = 0.5, duration = 1000) => {
  audio.volume = 0
  audio.play()
  
  const steps = 20
  const stepTime = duration / steps
  const volumeStep = targetVolume / steps
  
  const interval = setInterval(() => {
    audio.volume = Math.min(targetVolume, audio.volume + volumeStep)
    if (audio.volume >= targetVolume) {
      clearInterval(interval)
    }
  }, stepTime)
}
```

---

## 🎯 Priority Implementation Order

### Phase 1: Essential (Current)
- ✅ Background music (main menu)
- ✅ Background music (gameplay)

### Phase 2: UI Feedback
- [ ] Button click sounds
- [ ] Success/error sounds
- [ ] Notification sounds

### Phase 3: Immersion
- [ ] Ambient city sounds
- [ ] Transport vehicle sounds
- [ ] Station announcements

### Phase 4: Polish
- [ ] Volume controls in settings
- [ ] Music crossfades
- [ ] Spatial audio
- [ ] Dynamic music (changes based on game state)

---

## 🔗 Recommended Sound Libraries

### Free Sound Resources
- **Freesound.org** - Community sound library
- **Zapsplat.com** - Free sound effects
- **Incompetech.com** - Royalty-free music
- **OpenGameArt.org** - Game audio assets

### Paid Sound Libraries
- **Epidemic Sound** - Music subscription
- **AudioJungle** - Individual purchases
- **Soundly** - Professional SFX library

---

**Current Status:** ✅ Background music implemented  
**Next Steps:** Compile and add UI sound effects, then ambient city sounds
