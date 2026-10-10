import React, { useRef, useEffect } from 'react';
import { CombatEntity, Projectile, Particle, FighterData } from '../types/game';

interface FightCanvasProps {
  player: CombatEntity;
  opponent: CombatEntity;
  playerFighter: FighterData;
  opponentFighter: FighterData;
  projectiles: Projectile[];
  particles: Particle[];
  stageName: string;
  stageColor: string;
  screenShake: number;
  slowMoActive: boolean;
  onCanvasClick?: () => void;
}

export const FightCanvas: React.FC<FightCanvasProps> = ({
  player,
  opponent,
  playerFighter,
  opponentFighter,
  projectiles,
  particles,
  stageName,
  stageColor,
  screenShake,
  slowMoActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.save();

      // Screen shake calculation
      if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake * 8;
        const shakeY = (Math.random() - 0.5) * screenShake * 8;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Stage Background - Deep Obsidian Violet & Amethyst Mist
      ctx.fillStyle = '#0a0312';
      ctx.fillRect(0, 0, width, height);

      // Radial purple & white arena stadium glow
      const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 40, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
      bgGrad.addColorStop(0.4, 'rgba(88, 28, 135, 0.45)');
      bgGrad.addColorStop(1, '#08020f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Architectural Neon Purple Pillars
      ctx.fillStyle = 'rgba(46, 16, 80, 0.6)';
      for (let i = 0; i < 8; i++) {
        const px = i * (width / 7);
        ctx.fillRect(px, 110, 16, height - 190);
      }

      // Neon Header Sign - Pure White and Purple
      ctx.fillStyle = 'rgba(23, 7, 40, 0.85)';
      ctx.fillRect(width * 0.12, 35, width * 0.76, 44);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.12, 35, width * 0.76, 44);

      ctx.font = 'bold 18px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`★ WARRIOR ARENA // ${stageName.toUpperCase()} ★`, width / 2, 63);

      // Crowd silhouettes (Midnight Violet)
      ctx.fillStyle = 'rgba(19, 5, 33, 0.9)';
      for (let i = 0; i < width; i += 28) {
        const crowdHeight = 40 + Math.sin(i * 0.05 + Date.now() * 0.003) * 6;
        ctx.beginPath();
        ctx.arc(i + 14, height - 120 - crowdHeight + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(i, height - 120 - crowdHeight + 15, 28, crowdHeight);
      }

      // Arena Floor & Ring Border (Deep Amethyst & Glowing White Line)
      const floorY = height - 90;
      ctx.fillStyle = '#170629';
      ctx.fillRect(0, floorY, width, 90);

      // Glowing Pure White border line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(width, floorY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Floor grid perspective lines (Subtle violet glow)
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.2)';
      ctx.lineWidth = 1;
      for (let i = -10; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + i * 40, floorY);
        ctx.lineTo(width / 2 + i * 140, height);
        ctx.stroke();
      }

      // 2. Draw Fighter Shadows
      [player, opponent].forEach((f) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.ellipse(f.x + f.width / 2, floorY + 4, f.width * 0.6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Render Fighters (Styled in White & Purple)
      drawFighter(ctx, player, playerFighter, true, floorY);
      drawFighter(ctx, opponent, opponentFighter, false, floorY);

      // 4. Render Projectiles (Luminous White & Purple Bullets)
      projectiles.forEach((p) => {
        ctx.save();
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Projectile tail
        const tailX = p.x - Math.sign(p.vx) * p.radius * 2.8;
        const grad = ctx.createLinearGradient(tailX, p.y, p.x, p.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, '#a855f7');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(tailX, p.y);
        ctx.lineTo(p.x, p.y - p.radius);
        ctx.lineTo(p.x, p.y + p.radius);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // 5. Render Particles (Pure White & Purple Sparks)
      particles.forEach((pt) => {
        ctx.save();
        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.globalAlpha = alpha;

        if (pt.type === 'text' && pt.text) {
          ctx.font = 'bold 24px "Bungee", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#9333ea';
          ctx.shadowBlur = 12;
          ctx.textAlign = 'center';
          ctx.fillText(pt.text, pt.x, pt.y);
        } else if (pt.type === 'shockwave') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * (1 - alpha + 0.2), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#c084fc';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 6. Slow-mo vignette on K.O. (Radiant Purple Mist)
      if (slowMoActive) {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.25)';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [player, opponent, playerFighter, opponentFighter, projectiles, particles, stageName, stageColor, screenShake, slowMoActive]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#090210]">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full max-w-[1200px] object-contain drop-shadow-2xl select-none"
      />
    </div>
  );
};

// Procedural Sprite Drawing for Fighters (Exclusively White & Purple)
function drawFighter(
  ctx: CanvasRenderingContext2D,
  entity: CombatEntity,
  fighter: FighterData,
  isPlayer: boolean,
  floorY: number
) {
  ctx.save();

  const outfit = fighter.outfits[entity.activeOutfitIndex % fighter.outfits.length];
  const weapon = fighter.weapons[entity.activeWeaponIndex % fighter.weapons.length];

  // Two-tone palette: Primary Purple, Secondary Deep Violet, Accent Pure White
  const primaryColor = isPlayer ? '#a855f7' : '#9333ea';
  const secondaryColor = '#2e1065';
  const glowColor = '#ffffff';
  const accentColor = '#ffffff';

  const facing = entity.facing;
  const posX = entity.x + entity.width / 2;
  const posY = entity.y;

  // Stun / Damage blinking
  if (entity.invulnerableFrames > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Super move aura (Pure White and Violet)
  if (entity.state === 'super_move') {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 35;
  } else if (entity.superMeter >= 100) {
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 16;
  }

  // Block shield effect (Pure Luminous White & Purple Forcefield)
  if (entity.isBlocking) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    const shieldX = posX + facing * 30;
    ctx.arc(shieldX, posY + entity.height / 2, 45, -Math.PI / 2, Math.PI / 2, facing === -1);
    ctx.stroke();
    ctx.restore();
  }

  // State-based offsets
  let crouchOffset = 0;
  let punchOffset = 0;
  let kickOffset = 0;

  if (entity.state === 'crouch') crouchOffset = 25;
  if (entity.state === 'punch_light') punchOffset = 28;
  if (entity.state === 'punch_heavy') punchOffset = 45;
  if (entity.state === 'kick_light') kickOffset = 30;
  if (entity.state === 'kick_heavy') kickOffset = 48;
  if (entity.state === 'knocked_down') {
    ctx.translate(posX, posY + entity.height);
    ctx.rotate(facing * (Math.PI / 2.2));
    ctx.translate(-posX, -(posY + entity.height));
  }

  // Draw Torso (Purple Gi / Suit with White Belt & Crest)
  const torsoY = posY + 35 + crouchOffset;
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.roundRect(posX - 18, torsoY, 36, 48, 8);
  ctx.fill();

  // White belt & trim
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(posX - 20, torsoY + 28, 40, 8);
  ctx.fillStyle = '#d8b4fe';
  ctx.fillRect(posX - 5, torsoY + 26, 10, 12);

  // Draw Head
  const headY = posY + 15 + crouchOffset;
  ctx.fillStyle = '#f5d0fe'; // Soft crystal tone
  ctx.beginPath();
  ctx.arc(posX, headY, 15, 0, Math.PI * 2);
  ctx.fill();

  // Hair / Headband (Pure White / Deep Violet)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (fighter.gender === 'female') {
    ctx.arc(posX, headY - 4, 16, Math.PI, 0);
    ctx.lineTo(posX - facing * 20, headY + 12);
    ctx.lineTo(posX, headY);
    ctx.fill();
  } else {
    ctx.arc(posX, headY - 4, 16, Math.PI, 0);
    ctx.fill();
  }

  // Fighter Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(posX + facing * 4, headY - 2, 4, 4);
  ctx.fillStyle = '#3b0764';
  ctx.fillRect(posX + facing * 6, headY - 1, 2, 2);

  // Legs (Walk cycle / Crouch / Kick)
  const legY = torsoY + 48;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.strokeStyle = secondaryColor;

  if (kickOffset > 0) {
    ctx.beginPath();
    ctx.moveTo(posX, legY);
    ctx.lineTo(posX + facing * (35 + kickOffset), legY - 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(posX - facing * 10, legY);
    ctx.lineTo(posX - facing * 12, posY + entity.height);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(posX - 8, legY);
    ctx.lineTo(posX - 10 + (entity.state === 'walk_fwd' ? Math.sin(Date.now() * 0.02) * 12 : 0), posY + entity.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(posX + 8, legY);
    ctx.lineTo(posX + 10 - (entity.state === 'walk_fwd' ? Math.sin(Date.now() * 0.02) * 12 : 0), posY + entity.height);
    ctx.stroke();
  }

  // Arms & Weapons
  ctx.lineWidth = 9;
  ctx.strokeStyle = primaryColor;

  // Back arm
  ctx.beginPath();
  ctx.moveTo(posX - facing * 14, torsoY + 12);
  ctx.lineTo(posX - facing * 24, torsoY + 28);
  ctx.stroke();

  // Front arm (Punches / Weapon hold)
  ctx.beginPath();
  ctx.moveTo(posX + facing * 12, torsoY + 12);
  const handX = posX + facing * (24 + punchOffset);
  const handY = torsoY + (punchOffset > 0 ? 12 : 24);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Render Weapon in Hand (Pure White & Purple)
  if (weapon) {
    ctx.save();
    ctx.translate(handX, handY);

    if (weapon.type === 'blade') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(facing * 35, -facing * 12);
      ctx.stroke();

      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-facing * 4, 4);
      ctx.lineTo(facing * 6, -6);
      ctx.stroke();
    } else if (weapon.type === 'blaster') {
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(0, -5, facing * 22, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(facing * 18, -4, facing * 6, 8);
    } else if (weapon.type === 'gauntlets') {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(facing * 6, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Uppercut Energy VFX
  if (entity.state === 'special_uppercut') {
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(posX, posY + 20, 40, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  // Fighter Name & Flag indicator above head
  ctx.font = 'bold 12px "Rajdhani", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#3b0764';
  ctx.shadowBlur = 6;
  ctx.fillText(`${fighter.flag} ${fighter.name}`, posX, posY - 8);

  ctx.restore();
}
