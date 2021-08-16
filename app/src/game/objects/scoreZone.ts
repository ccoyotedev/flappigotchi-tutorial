// src/game/objects/scoreZone.ts

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
}

export class ScoreZone extends Phaser.GameObjects.Zone {
  constructor({ scene, x, y, width, height, velocityX }: Props) {
    super(scene, x, y);
    this.setOrigin(0, 0);
    this.displayHeight = height;
    this.displayWidth = width;

    // Physics
    this.scene.physics.world.enable(this);
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(velocityX);

    this.scene.add.existing(this);
  }

  public handleOverlap = () => {
    this.destroy();
  }
}
