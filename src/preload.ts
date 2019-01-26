export function preload(this: Phaser.Scene) {

    this.load.image('bg', './assets/publicDomain/paper_texture_cells_light_55327_1280x720.jpg');

    this.load.atlasXML('spritesheet_complete',
        './assets/kenney/platformer-pack-redux-360-assets/spritesheet_complete.png',
        './assets/kenney/platformer-pack-redux-360-assets/spritesheet_complete.xml'
    );
    this.load.atlasXML('spritesheet_items',
        './assets/kenney/voxel-pack/spritesheet_items.png',
        './assets/kenney/voxel-pack/spritesheet_items.xml'
    );
    this.load.atlasXML('spritesheet_items',
        './assets/kenney/voxel-pack/spritesheet_items.png',
        './assets/kenney/voxel-pack/spritesheet_items.xml'
    );
    this.load.atlasXML('spritesheet_tiles',
        './assets/kenney/voxel-pack/spritesheet_tiles.png',
        './assets/kenney/voxel-pack/spritesheet_tiles.xml'
    );
    this.load.spritesheet('platformer_redux',
        './assets/kenney/platformer-art-pixel-redux/spritesheet.png',
        {
            frameWidth: 32,
            // frameHeight:16,
            spacing: 2,
            margin: 0,
            endFrame: 30 * 30,

        }
    );
    this.load.spritesheet('platformercharacters_Player',
        './assets/kenney/kenney_platformercharacters/Player/player_tilesheet.png',
        {
            frameWidth: 80,
            frameHeight: 110,
            spacing: 0,
            margin: 0,
            endFrame: 24,
        }
    );
}

export function setUpAnimations(this: Phaser.Scene){
    this.anims.create({
        key: 'allOfPlayer',
        frames: this.anims.generateFrameNames(
            'platformercharacters_Player',
            { frames: new Array(24).fill(1).map((_, i) => i) }
        ),
        repeat: -1,
        frameRate: 4
    });
}