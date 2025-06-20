export function loadAndShowProfile(scene, avatarUrl, level, position) {
  if (!scene.profileElements) scene.profileElements = [];

  const savedPosition = { ...position };
  const savedLevel = level;

  const profileKey = generateProfileKey(avatarUrl);

  if (!scene.textures.exists(profileKey)) {
    scene.load.image(profileKey, avatarUrl);

    scene.load.once(`filecomplete-image-${profileKey}`, () => {
      showProfileImage(scene, level, position, profileKey);
    });

    scene.load.start();
  } else {
    showProfileImage(scene, savedLevel, savedPosition, profileKey);
  }
}

function showProfileImage(scene, level, position, profileKey) {
  if (!position) {
    console.error("❌ 'position' is undefined in showProfileImage");
    return;
  }

  // 1. Profile зураг
  const profileImage = scene.add
    .image(position.x, position.y, profileKey)
    .setDisplaySize(40, 40);
  scene.profileElements.push(profileImage);

  const maskShape = scene.add.graphics();
  maskShape.fillStyle(0xffffff);
  maskShape.fillCircle(position.x, position.y, 20);
  const mask = maskShape.createGeometryMask();
  profileImage.setMask(mask);

  maskShape.visible = false;

  const border = scene.add.graphics();
  border.lineStyle(3, 0x861d8f);
  border.strokeCircle(position.x, position.y, 20); // 30 = радиус
  scene.profileElements.push(border);

  // 4. ✨ Level text
  const levelText = scene.add.text(
    position.x - 15,
    position.y - 31,
    `LvL ${level}`,
    {
      fontSize: '8px',
      color: '#fff',
    }
  );
  scene.profileElements.push(levelText);
}
export function circleProfileImg(scene, avatarUrl, position) {
  if (!scene.profileElements) scene.profileElements = [];

  const savedPosition = { ...position };

  const profileKey = generateProfileKey(avatarUrl);

  if (!scene.textures.exists(profileKey)) {
    scene.load.image(profileKey, avatarUrl);

    scene.load.once(`filecomplete-image-${profileKey}`, () => {
      showCircleProfileImg(scene, position, profileKey);
    });

    scene.load.start();
  } else {
    showCircleProfileImg(scene, savedPosition, profileKey);
  }
}

function showCircleProfileImg(scene, position, profileKey) {
  if (!position) {
    console.error("❌ 'position' is undefined in showProfileImage");
    return;
  }

  // 1. Profile зураг
  const profileImage = scene.add
    .image(position.x, position.y, profileKey)
    .setDisplaySize(40, 40);
  scene.profileElements.push(profileImage);

  const maskShape = scene.add.graphics();
  maskShape.fillStyle(0xffffff);
  maskShape.fillCircle(position.x, position.y, 20);
  const mask = maskShape.createGeometryMask();
  profileImage.setMask(mask);

  maskShape.visible = false;

  const border = scene.add.graphics();
  border.lineStyle(3, 0x861d8f);
  border.strokeCircle(position.x, position.y, 20); // 30 = радиус
  scene.profileElements.push(border);
}

function generateProfileKey(url) {
  try {
    const seed = new URL(url).searchParams.get('seed');
    return `avatar_seed_${seed}`;
  } catch (e) {
    console.warn('❌ URL parsing failed:', url);
    return `avatar_fallback_${Math.random().toString(36).slice(2, 10)}`;
  }
}
