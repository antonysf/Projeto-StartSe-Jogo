const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

//criação do jogador//
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

// criação atirar projéteis//
class Projeteis {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// criação inimigos//
class Inimigo {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// criação das particulas
const friction = 0.99;
class Particulas {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projeteis = [];
let inimigos = [];
let particulas = [];

function init() {

    player = new Player(x, y, 10, 'white');
    projeteis = [];
    inimigos = [];
    particulas = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function gerarInimigos() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        };

        //troca a cor dos inimigos
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(canvas.height / 2 - y,
            canvas.width / 2 - x);

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };

        inimigos.push(new Inimigo(x, y, radius, color, velocity))
    }, 1000);
};

//animação//
let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particulas.forEach((particulas) => {
        particulas.update();

    });

    projeteis.forEach((projeteis, index) => {
        projeteis.update();

        //remove as bolas da tela
        if (projeteis.x + projeteis.radius < 0 ||
            projeteis.x - projeteis.radius > canvas.width ||
            projeteis.y + projeteis.radius < 0 ||
            projeteis.y - projeteis.radius > canvas.height
        ) {
            setTimeout(() => {
                projeteis.splice(index, 1)
            }, 0);

        };
    });

    inimigos.forEach((Inimigo, index) => {
        Inimigo.update();

        const distroi = Math.hypot(player.x - Inimigo.x, player.y - Inimigo.y);

        //fim do jogo
        if (distroi - Inimigo.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        };

        projeteis.forEach((projeteis, projeteisIndex) => {
            const distroi = Math.hypot(projeteis.x - Inimigo.x, projeteis.y - Inimigo.y);

            //objetos tocam
            if (distroi - Inimigo.radius - projeteis.radius < 1) {

                //cria explosões
                for (let i = 0; i < Inimigo.radius * 2; i++) {
                    particulas.push(new Particulas(projeteis.x, projeteis.y, Math.random() * 2, Inimigo.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 5),
                        y: (Math.random() - 0.5) * (Math.random() * 5)
                    }));
                };

                if (Inimigo.radius - 10 > 5) {

                    //cria score
                    score += 1;
                    scoreEl.innerHTML = score;

                    //adicionando um efeito com uma biblioteca gsap
                    gsap.to(Inimigo, {
                        radius: Inimigo.radius - 10
                    });

                    setTimeout(() => {
                        projeteis.splice(projeteisIndex, 1)
                    }, 0);

                } else {
                    //remove a cena completamente                     
                    score += 1;
                    scoreEl.innerHTML = score;

                    setTimeout(() => {
                        inimigos.splice(index, 1);
                        projeteis.splice(projeteisIndex, 1)
                    }, 0);
                };
            };
        });
    });
};

addEventListener('click', (event) => {


    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    );

    //velocidade dos projeteis
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };

    projeteis.push(
        new Projeteis(canvas.width / 2, canvas.height / 2,
            5, 'white', velocity)
    );
});

//cria evento clicar em start e começa o jogo
startGameBtn.addEventListener('click', () => {
    init();
    animate();
    gerarInimigos();
    modalEl.style.display = 'none';

});