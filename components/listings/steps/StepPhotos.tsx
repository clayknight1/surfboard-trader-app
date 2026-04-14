import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../../constants';
import { processPhoto } from '../../../lib/utils';

const MAX_PHOTOS = 5; // free tier — pass as prop later when wired to tier

const NUM_COLS = 3;
const GRID_PADDING = Spacing.screenPadding;
const GRID_GAP = 8;
const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE =
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (NUM_COLS - 1)) / NUM_COLS;
const PHOTO_HEIGHT = PHOTO_SIZE * 1.25; // 4:5 ratio

type StepPhotosProps = {
  photos: string[];
  setPhotos: (photos: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function StepPhotos({
  photos,
  setPhotos,
  onNext,
}: StepPhotosProps) {
  const isAtLimit = photos.length >= MAX_PHOTOS;

  // ─── Photo actions ──────────────────────────────────────────────

  async function pickPhotos(): Promise<void> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library in Settings.',
      );
      return;
    }

    const remaining = MAX_PHOTOS - photos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 1,
    });

    if (!result.canceled) {
      const processed = await Promise.all(
        result.assets.map(({ uri, width, height }) =>
          processPhoto(uri, width, height),
        ),
      );
      setPhotos([...photos, ...processed].slice(0, MAX_PHOTOS));
    }
  }

  async function capturePhoto(): Promise<void> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow camera access in Settings.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri, width, height } = result.assets[0];
      const processed = await processPhoto(uri, width, height);
      setPhotos([...photos, processed].slice(0, MAX_PHOTOS));
    }
  }

  function removePhoto(index: number): void {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
  }

  function setPrimary(index: number): void {
    if (index === 0) return; // already primary
    const updated = [...photos];
    const [tapped] = updated.splice(index, 1);
    updated.unshift(tapped);
    setPhotos(updated);
  }

  // ─── Render ─────────────────────────────────────────────────────

  // Build grid items: real photos + optional "add" slot
  type GridItem =
    | { type: 'photo'; uri: string; index: number }
    | { type: 'add' };

  const gridItems: GridItem[] = [
    ...photos.map((uri, index) => ({ type: 'photo' as const, uri, index })),
    ...(!isAtLimit ? [{ type: 'add' as const }] : []),
  ];

  function renderItem({ item }: { item: GridItem }) {
    if (item.type === 'add') {
      return (
        <TouchableOpacity style={styles.addSlot} onPress={pickPhotos}>
          <Ionicons name='add' size={28} color={Colors.textSecondary} />
          <Text style={styles.addSlotText}>Add photo</Text>
        </TouchableOpacity>
      );
    }

    const isPrimary = item.index === 0;

    return (
      <TouchableOpacity
        style={[styles.photoSlot, isPrimary && styles.photoSlotPrimary]}
        onPress={() => setPrimary(item.index)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.photo}
          contentFit='cover'
        />

        {/* Primary badge */}
        {isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>Cover</Text>
          </View>
        )}

        {/* Remove button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removePhoto(item.index)}
          hitSlop={8}
        >
          <Ionicons name='close' size={12} color={Colors.textPrimary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  const canContinue = photos.length > 0;

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.headingBlock}>
        <Text style={styles.question}>Add photos</Text>
        <Text style={styles.hint}>
          First photo is your cover.{' '}
          {photos.length === 0
            ? 'At least one photo is required.'
            : 'Tap a photo to make it the cover.'}
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        data={gridItems}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.type === 'add' ? 'add' : `photo-${item.index}`
        }
        numColumns={NUM_COLS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
      />

      {/* Photo count */}
      {photos.length > 0 && (
        <Text style={styles.countText}>
          {photos.length} of {MAX_PHOTOS} photos
        </Text>
      )}

      {/* Spacer pushes buttons to bottom */}
      <View style={{ flex: 1 }} />

      {/* Bottom actions */}
      <View style={[styles.footer]}>
        {/* Camera / Library row */}
        {!isAtLimit && (
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaButton} onPress={capturePhoto}>
              <Ionicons
                name='camera-outline'
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.mediaButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={pickPhotos}>
              <Ionicons
                name='images-outline'
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.mediaButtonText}>Library</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Continue */}
        <TouchableOpacity
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={!canContinue}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: GRID_PADDING,
  },
  headingBlock: {
    gap: 6,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  question: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  grid: {
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  photoSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_HEIGHT,
    borderRadius: 10,
    overflow: 'visible', // so the remove button peeks out
    position: 'relative',
  },
  photoSlotPrimary: {
    // blue ring — rendered via inner border trick
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_HEIGHT,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_HEIGHT,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addSlotText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  primaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  primaryBadgeText: {
    ...Typography.label,
    color: Colors.backgroundCard,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.backgroundSubtle,
    borderWidth: 1.5,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  footer: {
    gap: Spacing.sm,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    paddingVertical: 14,
  },
  mediaButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
});
