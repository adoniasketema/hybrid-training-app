// Deterministic photo picker for session feed cards. Hashing the workout id
// so the same session always shows the same photo, and adjacent sessions in
// the feed get a variety of images.

const PHOTOS: number[] = [
  require('@/assets/images/gym-classes.jpg'),
  require('@/assets/images/gym-coaching.jpg'),
  require('@/assets/images/gym-floor-view.jpg'),
  require('@/assets/images/gym-clubhouse.jpg'),
  require('@/assets/images/gym-recovery-therapy.jpg'),
  require('@/assets/images/gym-weightroom.png'),
  require('@/assets/images/gym-training.png'),
  require('@/assets/images/gym-recovery.png'),
];

export function photoForWorkout(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PHOTOS[hash % PHOTOS.length];
}
