import * as THREE from 'three';

export class CombatSystem {
    constructor(playerBike, targetSources, effectsManager) {
        this.playerBike = playerBike;
        this.targetSources = Array.isArray(targetSources) ? targetSources : [targetSources];
        this.effectsManager = effectsManager;
        this.punchRange = 4;
        this.kickRange = 5;
        this.attackCooldown = 0.4;
        this.lastAttackTime = 0;
    }
    
    update(delta, totalTime, keys) {
        if (totalTime - this.lastAttackTime < this.attackCooldown) return;
        
        if (keys.j) {
            this.executeAttack('punch', totalTime);
        } else if (keys.k) {
            this.executeAttack('kick', totalTime);
        }
    }
    
    executeAttack(type, time) {
        this.lastAttackTime = time;
        console.log(`Executing ${type}!`);
        
        const range = type === 'punch' ? this.punchRange : this.kickRange;
        const target = this.findNearbyTarget(range);
        
        if (target) {
            this.applyCombatEffect(target, type);
            return true;
        }
        return false;
    }
    
    findNearbyTarget(range) {
        const playerPos = this.playerBike.position;
        let closest = null;
        let minDist = range;
        
        for (const source of this.targetSources) {
            // Source can be TrafficManager (activeCars) or an array of enemy bikes
            const internalTargets = source.activeCars || (Array.isArray(source) ? source : [source]);
            
            for (const target of internalTargets) {
                const mesh = target.mesh || target; // Handle both EnemyAI objects and raw meshes
                if (!mesh.visible) continue;
                
                const dx = mesh.position.x - playerPos.x;
                const dz = mesh.position.z - playerPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < minDist && Math.abs(dz) < 3) {
                    minDist = dist;
                    closest = target;
                }
            }
        }
        return closest;
    }
    
    applyCombatEffect(target, type) {
        console.log(`HIT! Target ${type}ed.`);
        this.effectsManager.shake(type === 'kick' ? 1.0 : 0.5);
        
        const mesh = target.mesh || target;
        const physics = target.physics || null;
        
        // Push target away from player
        const dir = mesh.position.x > this.playerBike.position.x ? 1 : -1;
        const pushForce = type === 'kick' ? 8 : 4;
        
        mesh.position.x += dir * pushForce;
        
        // If it's an AI bike with physics, affect it more
        if (physics) {
            physics.isCrashed = true;
            console.log("AI BIKE CRASHED!");
        } else {
            // Traffic car
            mesh.rotation.z += dir * 0.5;
            if (type === 'kick') {
                target.speed *= 0.6;
            } else {
                target.speed *= 0.8;
            }
        }
    }
}
