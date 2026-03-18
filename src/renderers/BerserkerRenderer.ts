/**
 * 狂战士渲染器
 * 负责绘制狂战士角色形象
 */

import { CharacterConfig } from '../types/Character';
import { RenderParams, PreviewRenderParams, ICharacterRenderer } from './ICharacterRenderer';

/**
 * 狂战士渲染器
 */
export class BerserkerRenderer implements ICharacterRenderer {
  /**
   * 渲染战斗场景中的狂战士
   */
  renderBattle(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: RenderParams): void {
    const { cx, cy, scale, walkCycle, isMoving, attackProgress, swingAngle, chargeProgress } = params;
    
    // 腿部动画 - 更自然的行走节奏
    const rightLegAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.25 : 0;
    const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.25 : 0;
    const leftLegOffset = isMoving ? Math.sin(walkCycle) * 4 : 0;
    const rightLegOffset = isMoving ? Math.sin(walkCycle + Math.PI) * 4 : 0;

    // 后腿(左侧腿,因为向右走,左腿在后面)
    ctx.save();
    ctx.translate(cx - 5 * scale, cy + 28 * scale);
    ctx.rotate(leftLegAngle);
    // 腿部渐变
    const backLegGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    backLegGradient.addColorStop(0, '#2a1a1a');
    backLegGradient.addColorStop(0.5, '#3a2a2a');
    backLegGradient.addColorStop(1, '#1a0a0a');
    ctx.fillStyle = backLegGradient;
    // 大腿 - 更粗更自然
    ctx.beginPath();
    ctx.ellipse(0, leftLegOffset - 5 * scale, 6 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 小腿
    ctx.fillRect(-4 * scale, leftLegOffset + 6 * scale, 8 * scale, 17 * scale);
    // 脚 - 侧视轮廓
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.moveTo(-3 * scale, leftLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, leftLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, leftLegOffset + 28 * scale);
    ctx.lineTo(0 * scale, leftLegOffset + 31 * scale);
    ctx.lineTo(-3 * scale, leftLegOffset + 23 * scale);
    ctx.fill();
    // 脚底
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(-3 * scale, leftLegOffset + 28 * scale, 8 * scale, 2 * scale);
    ctx.restore();

    // 前腿(右侧腿,因为向右走,右腿在前面)
    ctx.save();
    ctx.translate(cx + 5 * scale, cy + 28 * scale);
    ctx.rotate(rightLegAngle);
    // 腿部渐变 - 前腿更亮
    const frontLegGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    frontLegGradient.addColorStop(0, '#3a2a2a');
    frontLegGradient.addColorStop(0.5, '#4a3a3a');
    frontLegGradient.addColorStop(1, '#2a1a1a');
    ctx.fillStyle = frontLegGradient;
    // 大腿 - 更粗更自然
    ctx.beginPath();
    ctx.ellipse(0, rightLegOffset - 5 * scale, 6 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 小腿
    ctx.fillRect(-4 * scale, rightLegOffset + 6 * scale, 8 * scale, 17 * scale);
    // 脚 - 侧视轮廓
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.moveTo(-3 * scale, rightLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, rightLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, rightLegOffset + 28 * scale);
    ctx.lineTo(0 * scale, rightLegOffset + 31 * scale);
    ctx.lineTo(-3 * scale, rightLegOffset + 23 * scale);
    ctx.fill();
    // 脚底高光
    ctx.fillStyle = '#3a2a2a';
    ctx.fillRect(-3 * scale, rightLegOffset + 28 * scale, 8 * scale, 2 * scale);
    ctx.restore();

    // 手臂动画：走路时手臂摆动
    const leftArmAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.2 : 0;
    const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.2 : 0;

    // 右臂 - 持剑（剑在身体后面）
    ctx.save();
    // 右臂基础位置
    ctx.translate(cx + 22 * scale, cy - 2 * scale);
    // 走路时手臂摆动，攻击时加上挥砍角度
    const armRotation = rightArmAngle - 0.3 + (attackProgress > 0 ? swingAngle : 0);
    ctx.rotate(armRotation);

    // 在手的位置绘制巨剑（手握住剑柄）
    // 巨剑 - 90单位长度，华丽设计
    const swordAngle = isMoving ? Math.sin(walkCycle) * 0.1 : 0;
    ctx.save();
    ctx.rotate(-0.2 + swordAngle); // 剑的基础角度和走路摆动

    // 粗铁剑柄 - 缠绕皮革质感
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-5 * scale, -7 * scale, 10 * scale, 14 * scale);

    // 剑柄纹理
    ctx.strokeStyle = '#2a1a0f';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 4; i++) {
      const y = -5 * scale + i * 3.5 * scale;
      ctx.beginPath();
      ctx.moveTo(-5 * scale, y);
      ctx.lineTo(5 * scale, y);
      ctx.stroke();
    }

    // 护手 - 更厚重的十字护手
    ctx.fillStyle = '#5a4a3a'; // 铁质感
    ctx.fillRect(-16 * scale, -14 * scale, 32 * scale, 8 * scale);
    // 护手阴影
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-16 * scale, -8 * scale, 32 * scale, 2 * scale);

    // 护手高光
    ctx.fillStyle = '#7a6a5a';
    ctx.fillRect(-16 * scale, -14 * scale, 32 * scale, 2 * scale);

    // 护手侧翼装饰
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-18 * scale, -12 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(14 * scale, -12 * scale, 4 * scale, 4 * scale);

    // 粗铁剑刃 - 更宽更厚重，剑长180像素（3单位射程）
    const bladeLength = 180 * scale; // 剑长对应射程3单位
    const bladeWidth = 10 * scale; // 粗剑
    const bladeGradient = ctx.createLinearGradient(-bladeWidth, -bladeLength, bladeWidth, -14 * scale);
    bladeGradient.addColorStop(0, '#5a5a5a'); // 剑尖深色
    bladeGradient.addColorStop(0.2, '#7a7a7a');
    bladeGradient.addColorStop(0.4, '#9a9a9a');
    bladeGradient.addColorStop(0.6, '#8a8a8a');
    bladeGradient.addColorStop(0.8, '#6a6a6a');
    bladeGradient.addColorStop(1, '#4a4a4a'); // 剑根深色

    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth, -14 * scale); // 剑根左侧
    ctx.lineTo(-bladeWidth * 0.7, -bladeLength + 10 * scale); // 中段收窄
    ctx.lineTo(0, -bladeLength); // 剑尖
    ctx.lineTo(bladeWidth * 0.7, -bladeLength + 10 * scale); // 中段收窄
    ctx.lineTo(bladeWidth, -14 * scale); // 剑根右侧
    ctx.closePath();
    ctx.fill();

    // 剑刃边缘 - 打磨效果
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth, -14 * scale);
    ctx.lineTo(-bladeWidth * 0.7, -bladeLength + 10 * scale);
    ctx.lineTo(0, -bladeLength);
    ctx.lineTo(bladeWidth * 0.7, -bladeLength + 10 * scale);
    ctx.lineTo(bladeWidth, -14 * scale);
    ctx.stroke();

    // 剑刃中线 - 血槽
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(-3 * scale, -19 * scale);
    ctx.lineTo(0, -109 * scale);
    ctx.lineTo(3 * scale, -19 * scale);
    ctx.closePath();
    ctx.fill();

    // 剑刃纹理 - 锻造痕迹
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 0.5 * scale;
    for (let i = 0; i < 6; i++) {
      const y = -24 * scale - i * 12 * scale;
      if (y < -104) break;
      ctx.beginPath();
      ctx.moveTo(-bladeWidth * 0.8 + i * 0.5 * scale, y);
      ctx.lineTo(bladeWidth * 0.8 - i * 0.5 * scale, y + 2);
      ctx.stroke();
    }

    // 剑刃锋芒（攻击时发光）
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2 * scale;

    // 蓄力状态 - 剑刃根据蓄力程度发光（蓄力中或蓄力攻击时）
    const isEnchanted = params.isEnchanted;
    if (chargeProgress > 0) {
      // 蓄力时剑刃逐渐变亮变红
      const chargeIntensity = chargeProgress; // 0-1
      const chargePulse = Math.sin(Date.now() / 100) * 0.2 + 0.8; // 蓄力时快速脉冲
      const redComponent = Math.floor(100 + chargeIntensity * 155); // 100-255
      const blurAmount = 15 + chargeIntensity * 25; // 15-40px模糊

      ctx.shadowColor = `rgb(${redComponent}, ${Math.floor(100 - chargeIntensity * 50)}, ${Math.floor(50 - chargeIntensity * 30)})`;
      ctx.shadowBlur = blurAmount * chargePulse;
      ctx.strokeStyle = `rgb(${Math.min(255, redComponent + 50)}, ${Math.floor(150 - chargeIntensity * 50)}, ${Math.floor(100 - chargeIntensity * 30)})`;
    } else if (isEnchanted) {
      // 附魔状态 - 持续发光
      const enchantPulse = Math.sin(Date.now() / 200) * 0.3 + 0.7; // 0.4-1.0之间波动
      ctx.shadowColor = '#ff0000'; // 红色附魔光芒
      ctx.shadowBlur = 30 * enchantPulse;
      ctx.strokeStyle = '#ff3333';
    } else if (attackProgress > 0.3 && attackProgress < 0.8) {
      // 攻击时发光效果 - 铁质光芒
      const glowIntensity = Math.sin((attackProgress - 0.3) / 0.5 * Math.PI);
      ctx.shadowColor = '#ff6644'; // 橙红色光芒
      ctx.shadowBlur = 20 * glowIntensity;
      ctx.strokeStyle = '#fff';
    }

    ctx.beginPath();
    ctx.moveTo(-bladeWidth * 0.5, -16 * scale);
    ctx.lineTo(0, -bladeLength + 5 * scale);
    ctx.lineTo(bladeWidth * 0.5, -16 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore(); // 结束剑的变换

    // 在剑柄位置绘制右手（握住剑）
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 手指握住剑柄的细节
    ctx.fillStyle = '#cc9977';
    ctx.beginPath();
    ctx.ellipse(-3 * scale, -2 * scale, 3 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3 * scale, -2 * scale, 3 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // 结束右手（和剑）的变换

    // 身体 - 更有质感的渐变
    const bodyGradient = ctx.createRadialGradient(cx - 5 * scale, cy - 10 * scale, 0, cx, cy, 22 * scale);
    bodyGradient.addColorStop(0, '#c43c3c'); // 高光
    bodyGradient.addColorStop(0.5, config.color); // 主色
    bodyGradient.addColorStop(1, '#6b1515'); // 阴影
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 身体高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx - 5 * scale, cy - 8 * scale, 8 * scale, 12 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 护肩 - 铁质厚重感
    const shoulderGradient = ctx.createLinearGradient(0, 0, 0, 24 * scale);
    shoulderGradient.addColorStop(0, '#9a9a9a');
    shoulderGradient.addColorStop(0.5, '#6a6a6a');
    shoulderGradient.addColorStop(1, '#4a4a4a');

    // 左护肩
    ctx.save();
    ctx.translate(cx - 20 * scale, cy - 10 * scale);
    ctx.rotate(-0.4);
    ctx.fillStyle = shoulderGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 护肩高光
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 右护肩
    ctx.save();
    ctx.translate(cx + 20 * scale, cy - 8 * scale);
    ctx.rotate(0.4);
    ctx.fillStyle = shoulderGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 护肩高光
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 胸甲 - 更厚重更有质感
    const chestGradient = ctx.createLinearGradient(cx - 12 * scale, 0, cx + 12 * scale, 0);
    chestGradient.addColorStop(0, '#5a0a0a');
    chestGradient.addColorStop(0.3, '#8B0000');
    chestGradient.addColorStop(0.7, '#8B0000');
    chestGradient.addColorStop(1, '#5a0a0a');

    ctx.fillStyle = chestGradient;
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 10 * scale, cy + 18 * scale);
    ctx.lineTo(cx, cy + 22 * scale);
    ctx.lineTo(cx - 10 * scale, cy + 18 * scale);
    ctx.closePath();
    ctx.fill();

    // 胸甲边框 - 铁质边缘
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // 胸甲高光边框
    ctx.strokeStyle = '#aa4a4a';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, cy - 18 * scale);
    ctx.lineTo(cx + 10 * scale, cy - 18 * scale);
    ctx.stroke();

    // 胸甲装饰 - 铁质纹路
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 22 * scale);
    ctx.lineTo(cx, cy + 22 * scale);
    ctx.stroke();

    // 胸甲铆钉
    const rivetPositions = [
      { x: cx, y: cy - 18 * scale },
      { x: cx, y: cy - 6 * scale },
      { x: cx, y: cy + 6 * scale },
      { x: cx, y: cy + 18 * scale },
    ];
    ctx.fillStyle = '#8a8a8a';
    rivetPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // 铆钉高光
      ctx.fillStyle = '#aaa';
      ctx.beginPath();
      ctx.arc(pos.x - 0.5 * scale, pos.y - 0.5 * scale, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a8a8a';
    });

    // 后臂(左手,在左护肩下方) - 手掌朝内（朝向身体）
    ctx.save();
    ctx.translate(cx - 22 * scale, cy + 8 * scale);
    ctx.rotate(leftArmAngle + 0.1);

    // 手臂 - 从肩膀到手掌
    const armGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    armGradient.addColorStop(0, '#cc9977');
    armGradient.addColorStop(0.5, '#ddaa88');
    armGradient.addColorStop(1, '#cc9977');
    ctx.fillStyle = armGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 5 * scale, 12 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 手掌 - 朝内
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 8 * scale, 5 * scale, 6 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 大拇指 - 朝内（左侧）
    ctx.beginPath();
    ctx.ellipse(5 * scale, 5 * scale, 2 * scale, 4 * scale, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 食指 - 朝内（左侧）
    ctx.beginPath();
    ctx.ellipse(-3 * scale, 14 * scale, 2 * scale, 5 * scale, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 中指
    ctx.beginPath();
    ctx.ellipse(-5 * scale, 13 * scale, 2 * scale, 5.5 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 无名指
    ctx.beginPath();
    ctx.ellipse(-6 * scale, 11 * scale, 1.8 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 小指
    ctx.beginPath();
    ctx.ellipse(-6 * scale, 9 * scale, 1.5 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 手掌渐变阴影
    const handGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 0);
    handGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    handGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = handGradient;
    ctx.beginPath();
    ctx.ellipse(0, 8 * scale, 5 * scale, 6 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 头部 - 侧脸效果,椭圆更扁
    const headGradient = ctx.createRadialGradient(cx + 3 * scale, cy - 38 * scale, 0, cx, cy - 35 * scale, 12 * scale);
    headGradient.addColorStop(0, '#eec090');
    headGradient.addColorStop(1, '#cc8866');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 35 * scale, 12 * scale, 14 * scale, 0, 0, Math.PI * 2); // 更窄的头部
    ctx.fill();

    // 头盔 - 侧脸效果,只画前面部分
    const helmetGradient = ctx.createLinearGradient(cx - 10 * scale, 0, cx + 10 * scale, 0);
    helmetGradient.addColorStop(0, '#6a0a0a');
    helmetGradient.addColorStop(0.5, config.color);
    helmetGradient.addColorStop(1, '#4a0a0a');

    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(cx, cy - 38 * scale, 14 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔高光(在右侧受光面)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(cx + 3 * scale, cy - 42 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔顶冠 - 侧脸只显示右边
    ctx.save();
    ctx.translate(cx, cy - 52 * scale);
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 8 * scale);
    ctx.lineTo(0, -12 * scale);
    ctx.lineTo(5 * scale, 8 * scale);
    ctx.closePath();
    ctx.fill();

    // 顶冠高光
    ctx.fillStyle = '#9a9a9a';
    ctx.beginPath();
    ctx.moveTo(0, 8 * scale);
    ctx.lineTo(0, -12 * scale);
    ctx.lineTo(2 * scale, 8 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 眼睛 - 侧脸只显示右眼
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(cx + 4 * scale, cy - 35 * scale, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛发光效果
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.arc(cx + 4 * scale, cy - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 眉毛 - 侧脸只显示右眉
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 2 * scale, cy - 40 * scale);
    ctx.lineTo(cx + 6 * scale, cy - 38 * scale);
    ctx.stroke();

    // 胡须 - 侧脸,更小
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 28 * scale);
    ctx.lineTo(cx + 5 * scale, cy - 25 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 28 * scale);
    ctx.lineTo(cx + 6 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 3 * scale, cy - 20 * scale);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 渲染狂战士预览（用于选角色界面）
   */
  renderPreview(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: PreviewRenderParams): void {
    const { x, y, scale } = params;

    // 腿部
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(x - 10 * scale, y + 25 * scale, 8 * scale, 25 * scale);
    ctx.fillRect(x + 2 * scale, y + 25 * scale, 8 * scale, 25 * scale);

    // 身体
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.ellipse(x, y, 20 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 护肩
    ctx.fillStyle = '#888899';
    ctx.beginPath();
    ctx.ellipse(x - 20 * scale, y - 10 * scale, 8 * scale, 12 * scale, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 20 * scale, y - 8 * scale, 8 * scale, 12 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(x - 12 * scale, y - 22 * scale);
    ctx.lineTo(x + 12 * scale, y - 22 * scale);
    ctx.lineTo(x + 10 * scale, y + 18 * scale);
    ctx.lineTo(x, y + 22 * scale);
    ctx.lineTo(x - 10 * scale, y + 18 * scale);
    ctx.closePath();
    ctx.fill();

    // 胸甲装饰
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y - 22 * scale);
    ctx.lineTo(x, y + 22 * scale);
    ctx.moveTo(x - 8 * scale, y - 15 * scale);
    ctx.lineTo(x - 5 * scale, y + 10 * scale);
    ctx.moveTo(x + 8 * scale, y - 15 * scale);
    ctx.lineTo(x + 5 * scale, y + 10 * scale);
    ctx.stroke();

    // 左臂 - 持剑
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x - 24 * scale, y - 8 * scale, 7 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 剑鞘
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x - 27 * scale, y - 43 * scale, 6 * scale, 25 * scale);

    // 巨剑
    const bladeGradient = ctx.createLinearGradient(x - 39 * scale, y - 135 * scale, x - 31 * scale, y - 45 * scale);
    bladeGradient.addColorStop(0, '#E8E8E8');
    bladeGradient.addColorStop(0.3, '#FFFFFF');
    bladeGradient.addColorStop(0.7, '#D0D0D0');
    bladeGradient.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(x - 39 * scale, y - 45 * scale);
    ctx.lineTo(x - 35 * scale, y - 135 * scale);
    ctx.lineTo(x - 31 * scale, y - 45 * scale);
    ctx.closePath();
    ctx.fill();

    // 剑刃锋芒
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y - 45 * scale);
    ctx.lineTo(x - 35 * scale, y - 135 * scale);
    ctx.stroke();

    // 护手
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(x - 47 * scale, y - 60 * scale, 24 * scale, 6 * scale);

    // 剑柄
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(x - 38 * scale, y - 60 * scale, 6 * scale, 12 * scale);

    // 剑刃发光
    ctx.shadowColor = '#C0C0FF';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 39 * scale, y - 45 * scale);
    ctx.lineTo(x - 35 * scale, y - 135 * scale);
    ctx.lineTo(x - 31 * scale, y - 45 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 右臂
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x + 22 * scale, y - 2 * scale, 7 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 头部
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 16 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 16 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔侧翼
    ctx.beginPath();
    ctx.moveTo(x - 16 * scale, y - 38 * scale);
    ctx.lineTo(x - 20 * scale, y - 45 * scale);
    ctx.lineTo(x - 18 * scale, y - 32 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 16 * scale, y - 38 * scale);
    ctx.lineTo(x + 20 * scale, y - 45 * scale);
    ctx.lineTo(x + 18 * scale, y - 32 * scale);
    ctx.fill();

    // 头盔顶冠
    ctx.beginPath();
    ctx.moveTo(x, y - 54 * scale);
    ctx.lineTo(x - 4 * scale, y - 44 * scale);
    ctx.lineTo(x + 4 * scale, y - 44 * scale);
    ctx.closePath();
    ctx.fill();

    // 护面甲
    ctx.fillStyle = '#666666';
    ctx.fillRect(x - 8 * scale, y - 42 * scale, 16 * scale, 8 * scale);

    // 眼睛
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x - 5 * scale, y - 35 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(x + 5 * scale, y - 35 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛发光
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 5 * scale, y - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.arc(x + 5 * scale, y - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
