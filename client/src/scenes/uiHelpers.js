export function loadAndShowProfile(scene, avatarUrl, level) {
  const { width } = scene.scale;

  if (!scene.profileElements) scene.profileElements = [];

  // 🔍 Энд өмнө нь бүртгэгдсэн эсэхийг шалгаж, бүртгэгдээгүй үед л ачаалж байна.
  if (!scene.textures.exists("profileImage")) {
    scene.load.image("profileImage", avatarUrl);
    scene.load.once("complete", () => {
      showProfileImage(scene, width, level);
    });
    scene.load.start();
  } else {
    // Хэрвээ аль хэдийн байна бол шууд харуулна
    showProfileImage(scene, width, level);
  }
}

function showProfileImage(scene, width, level) {
  const profileImage = scene.add
    .image(width * 0.1, width * 0.1, "profileImage")
    .setDisplaySize(60, 60);
  scene.profileElements.push(profileImage);

  const maskShape = scene.make.graphics({ x: 0, y: 0, add: false });
  maskShape.fillStyle(0xffffff);
  maskShape.fillCircle(width * 0.1, width * 0.1, 30);
  const mask = maskShape.createGeometryMask();
  profileImage.setMask(mask);

  const profileFrame = scene.add.sprite(
    width * 0.1,
    width * 0.1,
    "profileFrames",
    3
  );
  profileFrame.setDisplaySize(70, 70);
  scene.profileElements.push(profileFrame);

  const levelText = scene.add.text(
    width * 0.06,
    width * 0.135,
    `LvL ${level}`,
    {
      fontSize: "12px",
      color: "#000000",
    }
  );
  scene.profileElements.push(levelText);
}
