(function(){
  /* ============================================================
     UNIVERSAL: NAV + REVEAL + FOOTER YEAR
  ============================================================ */
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  if(burger && navLinks){
    burger.addEventListener('click', ()=>{
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
    }));
  }

  const revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:0.12 });
    revealEls.forEach(el=>io.observe(el));
  }

  /* ============================================================
     HOME: mandala petals
  ============================================================ */
  const petalsGroup = document.getElementById('petals');
  if(petalsGroup){
    const petalCount = 12;
    for(let i=0;i<petalCount;i++){
      const angle = (360/petalCount)*i;
      const petal = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      petal.setAttribute('cx','100'); petal.setAttribute('cy','46');
      petal.setAttribute('rx','6'); petal.setAttribute('ry','16');
      petal.setAttribute('fill', i % 2 === 0 ? '#B6A3D6' : '#C6A052');
      petal.setAttribute('opacity', i % 2 === 0 ? '0.55' : '0.4');
      petal.setAttribute('transform', 'rotate(' + angle + ' 100 100)');
      petalsGroup.appendChild(petal);
    }
  }

  /* ============================================================
     MEAL BALANCE CHECKER  (nutrition.html)
  ============================================================ */
  const checkPlateBtn = document.getElementById('checkPlateBtn');
  if(checkPlateBtn){
    checkPlateBtn.addEventListener('click', ()=>{
      const boxes = Array.from(document.querySelectorAll('#balanceChecks input[type=checkbox]'));
      const checked = boxes.filter(b=>b.checked);
      const n = checked.length;
      const slice = 360/6;
      let stops = [];
      boxes.forEach((b,i)=>{
        const start = i*slice, end = start+slice;
        const color = b.checked ? b.dataset.color : '#e8e0d4';
        stops.push(color + ' ' + start + 'deg ' + end + 'deg');
      });
      document.getElementById('plateVisual').style.background = 'conic-gradient(' + stops.join(',') + ')';
      document.getElementById('plateScore').textContent = n + '/6';
      const fb = document.getElementById('plateFeedback');
      if(n >= 5){ fb.textContent = "Beautifully balanced — this plate covers nearly every food group your body needs."; }
      else if(n >= 3){ fb.textContent = "Good start! Try adding " + (6-n) + " more group" + (6-n>1?'s':'') + " — vegetables and healthy fats are easy wins."; }
      else { fb.textContent = "Let's build this up — aim for at least grains, protein and vegetables on every plate."; }
    });
  }

  /* ============================================================
     RECIPE EXPLORER + DETAIL PANEL  (nutrition.html, needs recipes.js)
  ============================================================ */
  const recipeGrid = document.getElementById('recipeGrid');
  if(recipeGrid && typeof RECIPES !== 'undefined'){
    let recipeShown = 9;
    function renderRecipes(){
      const q = document.getElementById('recipeSearch').value.trim().toLowerCase();
      const cat = document.getElementById('recipeCat').value;
      const diet = document.getElementById('recipeDiet').value;
      const sort = document.getElementById('recipeSort').value;
      let list = RECIPES.filter(r=>{
        const matchQ = !q || r.n.toLowerCase().includes(q);
        const matchCat = cat === 'All' || r.c === cat;
        const matchDiet = diet === 'All' || r.d === diet;
        return matchQ && matchCat && matchDiet;
      });
      if(sort === 'protein') list = list.slice().sort((a,b)=>b.p-a.p);
      if(sort === 'cal-asc') list = list.slice().sort((a,b)=>a.cal-b.cal);
      recipeGrid.innerHTML = '';
      const visible = list.slice(0, recipeShown);
      visible.forEach(r=>{
        const dietClass = r.d === 'Veg' ? 'veg' : (r.d === 'Egg' ? 'egg' : 'nonveg');
        const card = document.createElement('div');
        card.className = 'card recipe-card';
        card.innerHTML =
          '<div class="recipe-top"><h3 style="font-size:1.02rem;">' + r.n + '</h3></div>' +
          '<div class="recipe-badges"><span class="badge cat">' + r.c + '</span><span class="badge ' + dietClass + '">' + r.d + '</span></div>' +
          '<div class="macro-row"><span><strong>' + r.cal + '</strong> cal</span><span><strong>' + r.p + 'g</strong> protein</span><span><strong>' + r.cb + 'g</strong> carbs</span><span><strong>' + r.f + 'g</strong> fat</span></div>' +
          '<div class="recipe-tags"><span>' + r.t[0] + '</span><span>' + r.t[1] + '</span></div>' +
          '<span class="recipe-view-link">View Full Recipe →</span>';
        card.addEventListener('click', ()=>openRecipe(r));
        recipeGrid.appendChild(card);
      });
      document.getElementById('recipeCount').textContent = 'Showing ' + visible.length + ' of ' + list.length + ' recipes';
      document.getElementById('loadMoreBtn').style.display = (recipeShown >= list.length) ? 'none' : 'inline-flex';
    }
    ['recipeSearch','recipeCat','recipeDiet','recipeSort'].forEach(id=>{
      const el = document.getElementById(id);
      el.addEventListener('input', ()=>{ recipeShown = 9; renderRecipes(); });
      el.addEventListener('change', ()=>{ recipeShown = 9; renderRecipes(); });
    });
    document.getElementById('loadMoreBtn').addEventListener('click', ()=>{ recipeShown += 9; renderRecipes(); });

    const detailPanel = document.getElementById('recipeDetail');
    const overlay = document.getElementById('recipeOverlay');
    function openRecipe(r){
      const dietClass = r.d === 'Veg' ? 'veg' : (r.d === 'Egg' ? 'egg' : 'nonveg');
      detailPanel.innerHTML =
        '<button class="recipe-detail-close" id="closeRecipeBtn">✕</button>' +
        '<span class="badge cat">' + r.c + '</span> <span class="badge ' + dietClass + '">' + r.d + '</span>' +
        '<h3>' + r.n + '</h3>' +
        '<p style="font-size:0.9rem; color:#5c5041; margin-top:10px;">' + r.desc + '</p>' +
        '<div class="recipe-detail-meta"><span>⏱ Prep ' + r.prep + ' min</span><span>🔥 Cook ' + r.cook + ' min</span><span>🍽 Serves ' + r.serves + '</span></div>' +
        '<div class="recipe-detail-macros"><div><strong>' + r.cal + '</strong><span>Cal</span></div><div><strong>' + r.p + 'g</strong><span>Protein</span></div><div><strong>' + r.cb + 'g</strong><span>Carbs</span></div><div><strong>' + r.f + 'g</strong><span>Fat</span></div></div>' +
        '<h4>Ingredients</h4><ul>' + r.ing.map(i=>'<li>'+i+'</li>').join('') + '</ul>' +
        '<h4>Method</h4><ol>' + r.steps.map(s=>'<li>'+s+'</li>').join('') + '</ol>' +
        '<div class="recipe-tags" style="margin-top:20px;">' + r.t.map(tag=>'<span>'+tag+'</span>').join('') + '</div>';
      detailPanel.classList.add('open');
      overlay.classList.add('open');
      document.getElementById('closeRecipeBtn').addEventListener('click', closeRecipe);
    }
    function closeRecipe(){ detailPanel.classList.remove('open'); overlay.classList.remove('open'); }
    overlay.addEventListener('click', closeRecipe);

    renderRecipes();
  }

  /* ============================================================
     HORMONE-FRIENDLY EATING — WHEEL + PANEL  (nutrition.html)
  ============================================================ */
  const PHASE_FOOD = {
    Menstrual: {
      color:'#C6A052',
      why: "Blood loss depletes iron and fluids — this phase calls for warm, iron-rich, easily digestible food to replenish and soothe cramps.",
      foods: ["Leafy Greens","Jaggery","Sesame Seeds","Beetroot","Warm Soups","Ginger Tea","Dates"],
      meal: [["Breakfast","Ragi porridge with jaggery & warm milk"],["Lunch","Dal palak, brown rice, beetroot salad"],["Snack","Dates & nut ladoo, ginger tea"],["Dinner","Warm khichdi with ghee"]]
    },
    Follicular: {
      color:'#79A88F',
      why: "Rising estrogen brings more energy and a resilient gut — a great window for fresh, sprouted and fermented foods.",
      foods: ["Sprouts","Idli / Dosa","Citrus Fruits","Lean Protein","Broccoli","Flaxseed","Curd"],
      meal: [["Breakfast","Vegetable idli with sambar"],["Lunch","Sprouts salad, grilled paneer or fish"],["Snack","Citrus fruit, roasted chana"],["Dinner","Stir-fried vegetables with quinoa"]]
    },
    Ovulatory: {
      color:'#B6A3D6',
      why: "Estrogen peaks around ovulation — fibre and antioxidants support your liver in metabolising extra hormones.",
      foods: ["Colourful Vegetables","Pumpkin Seeds","Berries","Leafy Salads","Coconut Water","Quinoa"],
      meal: [["Breakfast","Berry & seed smoothie bowl"],["Lunch","Rainbow salad with pumpkin seeds"],["Snack","Coconut water, fruit chaat"],["Dinner","Light vegetable curry with quinoa"]]
    },
    Luteal: {
      color:'#a9876b',
      why: "Progesterone rises and can bring PMS symptoms — complex carbs, magnesium and calcium help steady mood and cravings.",
      foods: ["Dark Chocolate (85%)","Nuts","Bananas","Sweet Potato","Warm Milk","Millets","Chamomile Tea"],
      meal: [["Breakfast","Millet porridge with banana"],["Lunch","Sweet potato & dal bowl"],["Snack","Dark chocolate square, handful of nuts"],["Dinner","Warm soup with whole-grain roti"]]
    }
  };
  const hormoneWheel = document.getElementById('hormoneWheel');
  if(hormoneWheel){
    function renderPhasePanel(phase){
      const data = PHASE_FOOD[phase];
      document.getElementById('phasePanel').innerHTML =
        '<h4>' + phase + ' Phase — What To Eat</h4>' +
        '<p class="why">' + data.why + '</p>' +
        '<div class="food-chips">' + data.foods.map(f=>'<span>'+f+'</span>').join('') + '</div>' +
        '<div class="meal-plan">' + data.meal.map(m=>'<div class="meal-plan-row"><strong>'+m[0]+'</strong><span>'+m[1]+'</span></div>').join('') + '</div>';
    }
    document.querySelectorAll('.hw-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.hw-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        renderPhasePanel(btn.dataset.phase);
      });
    });
    renderPhasePanel('Menstrual');
  }

  /* ============================================================
     SEED CYCLING CALENDAR  (nutrition.html)
  ============================================================ */
  const seedCal = document.getElementById('seedCal');
  if(seedCal){
    for(let d=1; d<=28; d++){
      const cell = document.createElement('div');
      cell.className = 'seed-day ' + (d<=14 ? 'p1' : 'p2');
      cell.textContent = d;
      cell.addEventListener('click', ()=>{
        cell.classList.toggle('done');
        updateStreak();
      });
      seedCal.appendChild(cell);
    }
    function updateStreak(){
      const done = seedCal.querySelectorAll('.seed-day.done').length;
      document.getElementById('seedStreak').textContent = done + ' of 28 days logged this cycle 🌰';
    }
    updateStreak();
  }

  /* ============================================================
     SEASONAL STAPLES  (nutrition.html)
  ============================================================ */
  const SEASON_DATA = {
    "Summer": { principle:"cooling, hydrating foods that balance internal heat and prevent dehydration",
      embrace:["Buttermilk (Chaas)","Cucumber","Watermelon","Mint","Coconut Water","Curd Rice"],
      reduce:["Deep-fried snacks","Excess tea/coffee","Very spicy curries","Red meat in large portions"] },
    "Monsoon": { principle:"warm, freshly cooked, immunity-supportive food — raw leafy greens are best avoided due to contamination risk",
      embrace:["Ginger-Turmeric Tea","Moong Dal Khichdi","Steamed Corn","Garlic","Warm Soups","Black Pepper Rasam"],
      reduce:["Raw salads & street-cut fruit","Roadside fried snacks","Excess dairy","Stagnant-water seafood"] },
    "Winter": { principle:"warming, energy-dense, ghee and jaggery-based foods that support metabolism in colder weather",
      embrace:["Til-Gud Ladoo","Sarson Saag","Bajra Roti","Root Vegetables","Warm Turmeric Milk","Dry Fruits"],
      reduce:["Cold drinks & ice cream","Raw salads at night","Excess caffeine (can dehydrate skin)"] },
    "Spring/Autumn": { principle:"light, gently detoxifying, seasonal greens that ease the transition between temperature extremes",
      embrace:["Neem","Seasonal Greens","Sprouts","Light Khichdi","Fresh Seasonal Fruits","Herbal Teas"],
      reduce:["Heavy, oily festive food in excess","Very cold beverages","Overeating at once"] }
  };
  const REGION_DATA = {
    "North India": "wheat, dairy, mustard greens and robust, ghee-forward dals — try a seasonal sarson saag or a light dal tadka.",
    "South India": "rice, coconut, fermented foods like idli and dosa, and tangy tamarind-based curries — a seasonal rasam is always a good call.",
    "East India": "rice, fish, mustard oil and a subtly sweet-savoury flavour profile — a light shorshe or shukto fits most seasons.",
    "West India": "millets, jaggery-tempered dals, and a mix of sweet-spicy-tangy Gujarati and Maharashtrian fare — think bajra roti with seasonal shaak.",
    "Northeast India": "fermented foods, bamboo shoot, leafy greens and minimal-oil steaming or boiling techniques — naturally gentle on digestion year-round."
  };
  const seasonSelect = document.getElementById('seasonSelect');
  if(seasonSelect){
    function renderSeason(){
      const season = document.getElementById('seasonSelect').value;
      const region = document.getElementById('regionSelect').value;
      const s = SEASON_DATA[season];
      const r = REGION_DATA[region];
      document.getElementById('seasonResult').innerHTML =
        '<h4>' + season + ' in ' + region + '</h4>' +
        '<p>This season calls for ' + s.principle + '. ' + region + ' cuisine traditionally leans on ' + r + '</p>' +
        '<div class="season-grid-cols">' +
          '<div class="season-block embrace"><h5>Embrace</h5><ul>' + s.embrace.map(f=>'<li>'+f+'</li>').join('') + '</ul></div>' +
          '<div class="season-block reduce"><h5>Ease Back On</h5><ul>' + s.reduce.map(f=>'<li>'+f+'</li>').join('') + '</ul></div>' +
        '</div>' +
        '<div class="ritucharya-note">🕉️ This mirrors <em>Ritucharya</em> — the Ayurvedic principle of adjusting diet and routine with the seasons rather than eating the same way year-round.</div>';
    }
    seasonSelect.addEventListener('change', renderSeason);
    document.getElementById('regionSelect').addEventListener('change', renderSeason);
    renderSeason();
  }

  /* ============================================================
     ASANA LIBRARY  (fitness.html)
  ============================================================ */
  const ASANAS = [
    { name:"Balasana", sanskrit:"Child's Pose", phase:"Menstrual", color:"#C6A052",
      benefit:"Calms the nervous system and gently releases lower back and hip tension.",
      female:"Reduces pelvic and lower-back cramping by relaxing the psoas and easing pressure on the uterus.",
      steps:["Kneel and sit back on your heels","Fold forward, arms extended or by your sides","Breathe slowly for 5–10 breaths"],
      svg:'<circle cx="100" cy="40" r="12" fill="#2A241E"/><path d="M100 52 C100 80, 60 80, 60 110 L140 110 C140 80, 100 80, 100 52 Z" fill="none" stroke="#2A241E" stroke-width="4"/><line x1="60" y1="110" x2="45" y2="120" stroke="#2A241E" stroke-width="4"/><line x1="140" y1="110" x2="155" y2="120" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Supta Baddha Konasana", sanskrit:"Reclining Bound Angle", phase:"Menstrual", color:"#C6A052",
      benefit:"Opens the hips and encourages deep relaxation and blood flow to the pelvis.",
      female:"Improves circulation to the reproductive organs and can ease menstrual cramping and lower-back ache.",
      steps:["Lie on your back, soles of feet together","Let knees fall open to each side","Rest hands on belly, breathe deeply for 1–2 minutes"],
      svg:'<circle cx="50" cy="90" r="12" fill="#2A241E"/><line x1="62" y1="90" x2="150" y2="90" stroke="#2A241E" stroke-width="4"/><path d="M150 90 L130 70 M150 90 L130 110" stroke="#2A241E" stroke-width="4" fill="none"/><path d="M130 70 L110 90 M130 110 L110 90" stroke="#2A241E" stroke-width="4" fill="none"/>' },
    { name:"Marjaryasana-Bitilasana", sanskrit:"Cat-Cow Flow", phase:"Menstrual", color:"#C6A052",
      benefit:"Mobilises the spine and eases menstrual or general lower-back cramping.",
      female:"The rhythmic spinal movement massages abdominal organs and can relieve bloating and cramps.",
      steps:["Come to hands and knees, wrists under shoulders","Inhale, drop belly and lift gaze (Cow)","Exhale, round spine and tuck chin (Cat) — repeat 8 rounds"],
      svg:'<circle cx="150" cy="75" r="12" fill="#2A241E"/><path d="M138 80 Q90 60 55 100" fill="none" stroke="#2A241E" stroke-width="4"/><line x1="55" y1="100" x2="55" y2="125" stroke="#2A241E" stroke-width="4"/><line x1="138" y1="90" x2="138" y2="120" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Bhujangasana", sanskrit:"Cobra Pose", phase:"Follicular", color:"#79A88F",
      benefit:"Strengthens the spine and opens the chest, building energy and posture.",
      female:"Stimulates ovarian and uterine blood flow and can support hormonal balance as estrogen rises.",
      steps:["Lie on your stomach, palms under shoulders","Press up, lifting chest while keeping hips grounded","Hold for 3–5 breaths, then release"],
      svg:'<circle cx="60" cy="70" r="12" fill="#2A241E"/><path d="M60 82 Q100 60 150 110" fill="none" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="90" x2="95" y2="115" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Trikonasana", sanskrit:"Triangle Pose", phase:"Follicular", color:"#79A88F",
      benefit:"Builds leg strength and stability while stretching the sides of the torso.",
      female:"Engages the core and pelvic girdle, building the functional strength useful across all cycle phases.",
      steps:["Stand with feet wide apart","Reach one hand down toward the shin, other arm up","Hold for 5 breaths, then switch sides"],
      svg:'<circle cx="100" cy="35" r="12" fill="#2A241E"/><line x1="100" y1="47" x2="100" y2="90" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="90" x2="65" y2="140" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="90" x2="135" y2="140" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="60" x2="60" y2="45" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="60" x2="140" y2="90" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Surya Namaskar (Light Flow)", sanskrit:"Sun Salutation", phase:"Follicular", color:"#79A88F",
      benefit:"A full-body flow that raises heart rate and builds heat and strength.",
      female:"Rising estrogen typically means more energy in this phase — a great window to build strength and stamina.",
      steps:["Flow through 3–5 gentle rounds","Move with your breath, one breath per movement","Keep the pace easy, not rushed"],
      svg:'<circle cx="100" cy="30" r="12" fill="#2A241E"/><line x1="100" y1="42" x2="100" y2="80" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="55" x2="70" y2="35" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="55" x2="130" y2="35" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="80" x2="80" y2="130" stroke="#2A241E" stroke-width="4"/><line x1="100" y1="80" x2="120" y2="130" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Malasana", sanskrit:"Garland Pose", phase:"Ovulatory", color:"#B6A3D6",
      benefit:"Improves hip mobility and gently strengthens the pelvic floor.",
      female:"Encourages healthy pelvic floor tone and hip mobility, both linked to reproductive and urinary health.",
      steps:["Squat with feet wider than hips","Bring palms together, elbows pressing knees apart","Hold for 30–60 seconds"],
      svg:'<circle cx="100" cy="40" r="12" fill="#2A241E"/><line x1="100" y1="52" x2="100" y2="90" stroke="#2A241E" stroke-width="4"/><path d="M100 90 L75 130 M100 90 L125 130" stroke="#2A241E" stroke-width="4" fill="none"/><path d="M75 130 L100 110 L125 130" stroke="#2A241E" stroke-width="4" fill="none"/>' },
    { name:"Ardha Matsyendrasana", sanskrit:"Half Spinal Twist", phase:"Ovulatory", color:"#B6A3D6",
      benefit:"A gentle detoxifying twist that massages the abdominal organs.",
      female:"Supports liver function, which plays a key role in metabolising excess estrogen at ovulation.",
      steps:["Sit with legs extended, bend one knee over the other","Twist gently toward the bent knee","Hold 5 breaths, then switch sides"],
      svg:'<circle cx="100" cy="35" r="12" fill="#2A241E"/><line x1="100" y1="47" x2="100" y2="90" stroke="#2A241E" stroke-width="4"/><path d="M100 90 L70 110 M100 90 L130 110" stroke="#2A241E" stroke-width="4" fill="none"/><line x1="100" y1="60" x2="60" y2="50" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Setu Bandhasana", sanskrit:"Bridge Pose", phase:"Luteal", color:"#a9876b",
      benefit:"A gentle backbend that lifts mood and relieves lower back tension.",
      female:"Can ease PMS-related lower-back ache and mildly boost circulation as progesterone rises.",
      steps:["Lie on your back, knees bent, feet hip-width","Press feet down and lift hips upward","Hold for 5 breaths, lower slowly"],
      svg:'<circle cx="50" cy="100" r="12" fill="#2A241E"/><path d="M62 100 Q100 60 138 100" fill="none" stroke="#2A241E" stroke-width="4"/><line x1="138" y1="100" x2="138" y2="130" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Viparita Karani", sanskrit:"Legs-Up-The-Wall", phase:"Luteal", color:"#a9876b",
      benefit:"A restorative inversion that reduces bloating and calms the mind.",
      female:"Encourages venous return from the legs and pelvis, easing the fluid retention common in the luteal phase.",
      steps:["Sit sideways against a wall, then swing legs up","Lie back, arms relaxed by your sides","Stay for 5–10 minutes, breathing slowly"],
      svg:'<circle cx="50" cy="120" r="12" fill="#2A241E"/><line x1="62" y1="120" x2="110" y2="120" stroke="#2A241E" stroke-width="4"/><line x1="110" y1="120" x2="110" y2="40" stroke="#2A241E" stroke-width="4"/><line x1="105" y1="115" x2="105" y2="45" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Paschimottanasana", sanskrit:"Seated Forward Fold", phase:"Luteal", color:"#a9876b",
      benefit:"Calms the nervous system and stretches the entire back body.",
      female:"The gentle compression can soothe cramping and its forward fold quality is naturally calming for PMS-related irritability.",
      steps:["Sit with legs extended forward","Hinge at the hips and reach toward your feet","Hold for 5–8 breaths, keeping the spine long"],
      svg:'<circle cx="140" cy="100" r="12" fill="#2A241E"/><line x1="140" y1="112" x2="70" y2="112" stroke="#2A241E" stroke-width="4"/><path d="M140 112 Q90 90 60 60" fill="none" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Anulom Vilom (Seated)", sanskrit:"Alternate Nostril Breathing", phase:"All", color:"#8c6f37",
      benefit:"A calming pranayama that balances the nervous system.",
      female:"Lowers cortisol, which indirectly supports smoother hormonal balance across every phase.",
      steps:["Sit comfortably with a tall spine","Close the right nostril, inhale through the left","Close the left, exhale through the right — then reverse, repeat for 2 minutes"],
      svg:'<circle cx="100" cy="35" r="12" fill="#2A241E"/><line x1="100" y1="47" x2="100" y2="100" stroke="#2A241E" stroke-width="4"/><path d="M100 60 L75 80 M100 60 L125 80" stroke="#2A241E" stroke-width="4" fill="none"/><path d="M100 100 L80 130 M100 100 L120 130" stroke="#2A241E" stroke-width="4" fill="none"/>' },
    { name:"Ustrasana", sanskrit:"Camel Pose", phase:"Follicular", color:"#79A88F",
      benefit:"Opens the chest and hip flexors while building back strength.",
      female:"Counters the forward-hunched posture of daily life and can support better breathing capacity during workouts.",
      steps:["Kneel with hips over knees","Reach back to hold your heels, lifting the chest","Hold for 3–5 breaths, then release gently"],
      svg:'<circle cx="100" cy="40" r="12" fill="#2A241E"/><line x1="100" y1="52" x2="100" y2="90" stroke="#2A241E" stroke-width="4"/><path d="M100 60 Q130 70 135 100" stroke="#2A241E" stroke-width="4" fill="none"/><line x1="100" y1="90" x2="95" y2="125" stroke="#2A241E" stroke-width="4"/>' },
    { name:"Shavasana", sanskrit:"Corpse Pose", phase:"All", color:"#8c6f37",
      benefit:"Deep, deliberate rest that lets the nervous system fully integrate a practice.",
      female:"A closing rest that supports the parasympathetic ('rest and digest') state hormonal balance depends on.",
      steps:["Lie flat on your back, arms relaxed by your sides","Let your feet fall open naturally","Stay for 3–5 minutes, breathing naturally"],
      svg:'<circle cx="40" cy="100" r="12" fill="#2A241E"/><line x1="52" y1="100" x2="160" y2="100" stroke="#2A241E" stroke-width="4"/><line x1="90" y1="100" x2="80" y2="80" stroke="#2A241E" stroke-width="4"/><line x1="120" y1="100" x2="130" y2="80" stroke="#2A241E" stroke-width="4"/>' }
  ];
  const asanaGrid = document.getElementById('asanaGrid');
  if(asanaGrid){
    function renderAsanas(filter){
      asanaGrid.innerHTML = '';
      const list = ASANAS.filter(a => filter === 'All' || a.phase === filter || a.phase === 'All');
      list.forEach((a,idx)=>{
        const card = document.createElement('div');
        card.className = 'card asana-card';
        const stepId = 'asanaSteps' + idx + '-' + a.name.replace(/[^a-zA-Z]/g,'');
        card.innerHTML =
          '<span class="asana-phase-tag" style="background:' + a.color + '22; color:' + a.color + ';">' + a.phase + '</span>' +
          '<div class="asana-svg-wrap"><svg viewBox="0 0 200 160" width="140" height="120">' + a.svg + '</svg></div>' +
          '<div><div class="asana-name">' + a.name + '</div><div class="asana-sanskrit">' + a.sanskrit + '</div></div>' +
          '<p class="asana-benefit">' + a.benefit + '</p>' +
          '<div class="asana-female-benefit">♀ ' + a.female + '</div>' +
          '<button class="asana-toggle" data-target="' + stepId + '">How to do it ▾</button>' +
          '<ol class="asana-steps" id="' + stepId + '">' + a.steps.map(s=>'<li>'+s+'</li>').join('') + '</ol>';
        asanaGrid.appendChild(card);
      });
      asanaGrid.querySelectorAll('.asana-toggle').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const target = document.getElementById(btn.dataset.target);
          const isShown = target.classList.toggle('show');
          btn.textContent = (isShown ? 'Hide steps ▴' : 'How to do it ▾');
        });
      });
    }
    document.querySelectorAll('#asanaTabs .phase-tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        document.querySelectorAll('#asanaTabs .phase-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        renderAsanas(tab.dataset.phase);
      });
    });
    renderAsanas('All');
  }

  /* ============================================================
     INFO ACCORDIONS  (fitness.html strength/recovery, generic)
  ============================================================ */
  document.querySelectorAll('.info-accordion-head').forEach(head=>{
    head.addEventListener('click', ()=>{
      const acc = head.closest('.info-accordion');
      const body = acc.querySelector('.info-accordion-body');
      const isOpen = acc.classList.toggle('open');
      body.style.maxHeight = isOpen ? body.scrollHeight + 'px' : '0';
    });
  });

  /* ============================================================
     MENTAL HEALTH  (mind.html)
  ============================================================ */
  const prompts = [
    "What is one thing my body did well for me today?",
    "What emotion visited me most today — and what did it need?",
    "What would I tell a younger version of myself right now?",
    "What is one small thing I can let go of tonight?",
    "Where in my body do I feel the most ease today?",
    "What did I nourish myself with today — food, rest, or kindness?",
    "What is a boundary I honoured today, however small?",
    "What made me feel most myself this week?"
  ];
  const promptBox = document.getElementById('promptBox');
  if(promptBox){
    let lastPrompt = 0;
    document.getElementById('promptBtn').addEventListener('click', ()=>{
      let idx;
      do { idx = Math.floor(Math.random()*prompts.length); } while(idx === lastPrompt);
      lastPrompt = idx;
      promptBox.textContent = prompts[idx];
    });
  }

  const MOOD_SUGGESTIONS = {
    '😌':"You're steady today — a good day to journal or plan ahead.",
    '😔':"Be gentle with yourself. Try the breathing reset below, or step outside for five minutes.",
    '😤':"That energy needs somewhere to go — a short walk or the strength routine can help release it.",
    '😴':"Low energy is information, not failure. Consider an early night and the sleep checklist below.",
    '🥹':"Let it move through you. Journaling or simply naming the feeling out loud can help."
  };
  const moodRow = document.getElementById('moodRow');
  if(moodRow){
    moodRow.querySelectorAll('.mood-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        moodRow.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('moodSuggestion').textContent = MOOD_SUGGESTIONS[btn.textContent] || "Thanks for checking in with yourself today.";
      });
    });
  }

  /* Breathing — lotus SVG */
  const breatheLabel = document.getElementById('breatheLabel');
  if(breatheLabel){
    const petals = document.querySelectorAll('.lotus-petal');
    let mode = 'relax'; // relax = 4-2-4, box = 4-4-4-4
    let breatheTimer = null;
    const MODES = {
      relax: [ {label:'Inhale…', dur:4000, scale:1.3}, {label:'Hold', dur:2000, scale:1.3}, {label:'Exhale…', dur:4000, scale:0.85} ],
      box: [ {label:'Inhale…', dur:4000, scale:1.3}, {label:'Hold', dur:4000, scale:1.3}, {label:'Exhale…', dur:4000, scale:0.85}, {label:'Hold', dur:4000, scale:0.85} ]
    };
    let step = 0;
    function runStep(){
      const seq = MODES[mode];
      const s = seq[step % seq.length];
      breatheLabel.textContent = s.label;
      petals.forEach(p=>{ p.style.transform = 'scale(' + s.scale + ')'; });
      step++;
      breatheTimer = setTimeout(runStep, s.dur);
    }
    document.querySelectorAll('.mode-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.dataset.mode;
      });
    });
    document.getElementById('breatheBtn').addEventListener('click', (e)=>{
      if(breatheTimer){
        clearTimeout(breatheTimer); breatheTimer = null;
        breatheLabel.textContent = 'Breathe';
        petals.forEach(p=>{ p.style.transform = 'scale(1)'; });
        e.target.textContent = 'Start Breathing';
        return;
      }
      step = 0; runStep();
      e.target.textContent = 'Stop';
      setTimeout(()=>{ if(breatheTimer){ clearTimeout(breatheTimer); breatheTimer=null; breatheLabel.textContent='Breathe'; petals.forEach(p=>{p.style.transform='scale(1)';}); document.getElementById('breatheBtn').textContent='Start Breathing'; } }, 75000);
    });
  }

  /* Sleep checklist */
  const sleepList = document.getElementById('sleepList');
  if(sleepList){
    function updateSleepScore(){
      const total = sleepList.querySelectorAll('input').length;
      const checked = sleepList.querySelectorAll('input:checked').length;
      document.getElementById('sleepScore').textContent = checked + ' of ' + total + ' good sleep habits in place tonight 🌙';
    }
    sleepList.querySelectorAll('input').forEach(i=>i.addEventListener('change', updateSleepScore));
    updateSleepScore();
  }

  /* Grounding 5-4-3-2-1 */
  const groundingBtn = document.getElementById('groundingBtn');
  if(groundingBtn){
    const steps = document.querySelectorAll('.grounding-step');
    let gi = 0;
    groundingBtn.addEventListener('click', ()=>{
      steps.forEach(s=>s.classList.remove('show'));
      if(gi >= steps.length){ gi = 0; groundingBtn.textContent = 'Start Grounding Exercise'; return; }
      steps[gi].classList.add('show');
      gi++;
      groundingBtn.textContent = gi < steps.length ? 'Next Step →' : 'Finish';
    });
  }

  /* ============================================================
     SKIN PAGE — CYCLE TIMELINE  (skin.html)
  ============================================================ */
  const SKIN_DATA = {
    Menstrual: { color:'#C6A052', expect:"Estrogen and progesterone are both at their lowest — skin often looks a little dull and can feel more sensitive or reactive.",
      whatToDo:["Stick to a gentle, fragrance-light cleanser","Avoid introducing new actives this week","Add a rich moisturiser if skin feels tight"],
      avoid:["Aggressive exfoliation or peels","New retinoid or acid introductions","Very hot water on the face"] },
    Follicular: { color:'#79A88F', expect:"Rising estrogen boosts collagen and blood flow — skin often looks brighter, plumper and more resilient this week.",
      whatToDo:["Great week to introduce a new active (patch-test first)","Exfoliate gently 1–2 times if skin tolerates it","Lean into vitamin C for brightness"],
      avoid:["Over-cleansing (skin barrier is strong, no need to overdo it)"] },
    Ovulatory: { color:'#B6A3D6', expect:"Estrogen peaks — this is usually the most radiant, glow-forward window of the cycle, but oil production is also rising.",
      whatToDo:["Lightweight, non-comedogenic moisturiser","Blotting or mattifying products if you get midday shine","SPF is non-negotiable — this is peak-glow week, protect it"],
      avoid:["Heavy, occlusive creams that trap excess oil"] },
    Luteal: { color:'#a9876b', expect:"Progesterone rises and androgens become relatively more dominant — oil glands often go into overdrive, which is why breakouts cluster here.",
      whatToDo:["Add a gentle salicylic or niacinamide product if breakout-prone","Keep routine consistent — this is not the week to experiment","Manage stress; cortisol can worsen luteal-phase breakouts"],
      avoid:["Picking at blemishes (post-inflammatory marks heal slower under high progesterone)","Introducing 3 new products at once"] }
  };
  const skinTimeline = document.getElementById('skinTimeline');
  if(skinTimeline){
    function renderSkin(phase){
      const d = SKIN_DATA[phase];
      document.getElementById('skinPanel').innerHTML =
        '<h4>' + phase + ' Phase — Your Skin</h4>' +
        '<p class="expect">' + d.expect + '</p>' +
        '<div class="skin-cols">' +
          '<div class="skin-block"><h5>Do This</h5><ul>' + d.whatToDo.map(x=>'<li>'+x+'</li>').join('') + '</ul></div>' +
          '<div class="skin-block"><h5>Skip This</h5><ul>' + d.avoid.map(x=>'<li>'+x+'</li>').join('') + '</ul></div>' +
        '</div>';
    }
    skinTimeline.querySelectorAll('.skin-tl-node').forEach(node=>{
      node.addEventListener('click', ()=>{
        skinTimeline.querySelectorAll('.skin-tl-node').forEach(n=>n.classList.remove('active'));
        node.classList.add('active');
        node.querySelector('.skin-tl-dot').style.setProperty('--tab-color', SKIN_DATA[node.dataset.phase].color);
        renderSkin(node.dataset.phase);
      });
    });
    renderSkin('Menstrual');
  }

  /* ============================================================
     CYCLE TRACKER WHEEL  (cycle.html)
  ============================================================ */
  const cycleWheel = document.getElementById('cycleWheel');
  if(cycleWheel){
    const marker = document.getElementById('wheelMarker');
    const dayNum = document.getElementById('dayNum');
    const phaseName = document.getElementById('phaseName');
    const cycleResults = document.getElementById('cycleResults');

    function fmtDate(d){ return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }
    function paintWheel(periodLen, cycleLen, fertileStart, fertileEnd){
      const p1 = (periodLen/cycleLen)*360;
      const p2 = (fertileStart/cycleLen)*360;
      const p3 = (fertileEnd/cycleLen)*360;
      cycleWheel.style.background = 'conic-gradient(from 0deg,#C6A052 0deg ' + p1 + 'deg,#DCEAE2 ' + p1 + 'deg ' + p2 + 'deg,#B6A3D6 ' + p2 + 'deg ' + p3 + 'deg,#F4E3DA ' + p3 + 'deg 360deg)';
    }
    function updateMarker(cycleDay, cycleLen){
      const angle = (cycleDay/cycleLen)*2*Math.PI;
      const r = 50;
      marker.style.left = (50 + r*Math.sin(angle)) + '%';
      marker.style.top = (50 - r*Math.cos(angle)) + '%';
    }
    function calcCycle(){
      const lastInput = document.getElementById('lastPeriod').value;
      const cycleLen = parseInt(document.getElementById('cycleLength').value) || 28;
      const periodLen = parseInt(document.getElementById('periodLength').value) || 5;
      if(!lastInput) return;
      const lastDate = new Date(lastInput + 'T00:00:00');
      const today = new Date(); today.setHours(0,0,0,0);
      let diffDays = Math.floor((today - lastDate)/86400000);
      let cycleDay = ((diffDays % cycleLen) + cycleLen) % cycleLen + 1;
      const ovulationDay = Math.max(cycleLen - 14, periodLen+1);
      const fertileStart = Math.max(ovulationDay - 5, periodLen+1);
      const fertileEnd = Math.min(ovulationDay + 1, cycleLen);
      let phase;
      if(cycleDay <= periodLen) phase = 'Menstrual';
      else if(cycleDay < fertileStart) phase = 'Follicular';
      else if(cycleDay <= fertileEnd) phase = 'Fertile Window';
      else phase = 'Luteal';
      let nextPeriod = new Date(lastDate);
      while(nextPeriod <= today){ nextPeriod.setDate(nextPeriod.getDate()+cycleLen); }
      const fertileStartDate = new Date(nextPeriod); fertileStartDate.setDate(fertileStartDate.getDate() - (cycleLen - fertileStart));
      const fertileEndDate = new Date(nextPeriod); fertileEndDate.setDate(fertileEndDate.getDate() - (cycleLen - fertileEnd));
      dayNum.textContent = cycleDay;
      phaseName.textContent = phase;
      paintWheel(periodLen, cycleLen, fertileStart, fertileEnd);
      updateMarker(cycleDay, cycleLen);
      document.getElementById('resDay').textContent = 'Day ' + cycleDay + ' of ' + cycleLen;
      document.getElementById('resPhase').textContent = phase;
      document.getElementById('resNext').textContent = fmtDate(nextPeriod);
      document.getElementById('resFertile').textContent = fmtDate(fertileStartDate) + ' – ' + fmtDate(fertileEndDate);
      cycleResults.style.display = 'grid';
    }
    document.getElementById('calcCycleBtn').addEventListener('click', calcCycle);
    paintWheel(5,28,9,15);
    updateMarker(1,28);
  }

  /* Hormone curve chart (SVG line, pure CSS/SVG, no lib) */
  const hormoneChart = document.getElementById('hormoneChart');
  if(hormoneChart){
    function pts(fn){
      let d = '';
      for(let x=0; x<=28; x++){
        const px = 20 + (x/28)*560;
        const py = 140 - fn(x)*110;
        d += (x===0?'M':'L') + px.toFixed(1) + ',' + py.toFixed(1) + ' ';
      }
      return d;
    }
    const estrogen = (x)=> 0.15 + 0.55*Math.exp(-Math.pow((x-13)/4,2)) + 0.15*Math.exp(-Math.pow((x-22)/4,2));
    const progesterone = (x)=> x<14 ? 0.08 : 0.15 + 0.7*Math.exp(-Math.pow((x-21)/5,2));
    hormoneChart.innerHTML =
      '<svg viewBox="0 0 600 160" width="100%" height="160">' +
      '<path d="' + pts(estrogen) + '" fill="none" stroke="#B6A3D6" stroke-width="3"/>' +
      '<path d="' + pts(progesterone) + '" fill="none" stroke="#C6A052" stroke-width="3"/>' +
      '<line x1="20" y1="145" x2="580" y2="145" stroke="#e8e0d4" stroke-width="1"/>' +
      '</svg>';
  }

  /* Trivia shuffle */
  const triviaBtn = document.getElementById('triviaBtn');
  if(triviaBtn){
    const facts = [
      "The average menstrual cycle is 28 days, but anywhere from 21–35 days is considered normal.",
      "Estrogen peaks just before ovulation — around the same time cervical mucus becomes clear and stretchy.",
      "Progesterone is named for its role in 'pro-gestation' — it prepares the uterine lining for a possible pregnancy.",
      "Body temperature typically rises by 0.3–0.5°C right after ovulation and stays elevated through the luteal phase.",
      "Only about 1 in 4 women has a true 28-day cycle every single month — natural variation is completely normal.",
      "The uterine lining you shed during your period is regrown almost entirely by your next ovulation."
    ];
    triviaBtn.addEventListener('click', ()=>{
      document.getElementById('triviaText').textContent = facts[Math.floor(Math.random()*facts.length)];
    });
    document.getElementById('triviaText').textContent = facts[0];
  }

  /* ============================================================
     UNIT TOGGLE (cycle.html calculators)
  ============================================================ */
  const unitToggle = document.getElementById('calcUnitToggle');
  if(unitToggle){
    unitToggle.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        unitToggle.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const unit = btn.dataset.unit;
        document.querySelectorAll('.met-fields').forEach(el=> el.classList.toggle('hide', unit==='imperial'));
        document.querySelectorAll('.imp-fields').forEach(el=> el.classList.toggle('show', unit==='imperial'));
        document.querySelectorAll('.imp-fields').forEach(el=> el.style.display = unit==='imperial' ? 'grid' : 'none');
        document.querySelectorAll('.met-fields').forEach(el=> el.style.display = unit==='imperial' ? 'none' : 'grid');
      });
    });
  }
  function getCurrentUnit(){
    const active = document.querySelector('#calcUnitToggle button.active');
    return active ? active.dataset.unit : 'metric';
  }
  function cmFromFtIn(ft, inch){ return ((ft||0)*12 + (inch||0)) * 2.54; }
  function kgFromLb(lb){ return (lb||0) * 0.453592; }

  /* ============================================================
     BMI CALCULATOR
  ============================================================ */
  const bmiBtn = document.getElementById('bmiBtn');
  if(bmiBtn){
    bmiBtn.addEventListener('click', ()=>{
      const unit = getCurrentUnit();
      const box = document.getElementById('bmiResult');
      let h, w;
      if(unit === 'metric'){
        h = parseFloat(document.getElementById('bmiHeightCm').value);
        w = parseFloat(document.getElementById('bmiWeightKg').value);
      } else {
        h = cmFromFtIn(parseFloat(document.getElementById('bmiHeightFt').value), parseFloat(document.getElementById('bmiHeightIn').value));
        w = kgFromLb(parseFloat(document.getElementById('bmiWeightLb').value));
      }
      if(!h || !w){ box.innerHTML = 'Please enter both height and weight.'; return; }
      const bmi = w / ((h/100)*(h/100));
      let cat;
      if(bmi < 18.5) cat = 'Underweight';
      else if(bmi < 23) cat = 'Normal Range';
      else if(bmi < 25) cat = 'Overweight';
      else cat = 'Obese';
      box.innerHTML = '<span class="big">' + bmi.toFixed(1) + '</span>' + cat + '<br><span style="font-size:0.78rem; color:#8a7c6a;">Uses Asian-specific BMI cutoffs. Not a diagnosis — consult a professional for a full assessment.</span>';
    });
  }

  /* ============================================================
     TDEE CALCULATOR
  ============================================================ */
  const tdeeBtn = document.getElementById('tdeeBtn');
  if(tdeeBtn){
    tdeeBtn.addEventListener('click', ()=>{
      const unit = getCurrentUnit();
      const box = document.getElementById('tdeeResult');
      const age = parseFloat(document.getElementById('tdeeAge').value);
      const mult = parseFloat(document.getElementById('tdeeActivity').value);
      let h, w;
      if(unit === 'metric'){
        w = parseFloat(document.getElementById('tdeeWeightKg').value);
        h = parseFloat(document.getElementById('tdeeHeightCm').value);
      } else {
        w = kgFromLb(parseFloat(document.getElementById('tdeeWeightLb').value));
        h = cmFromFtIn(parseFloat(document.getElementById('tdeeHeightFt').value), parseFloat(document.getElementById('tdeeHeightIn').value));
      }
      if(!age || !w || !h){ box.innerHTML = 'Please fill in age, weight and height.'; return; }
      const bmr = (10*w) + (6.25*h) - (5*age) - 161;
      const tdee = bmr * mult;
      box.innerHTML = '<span class="big">' + Math.round(tdee) + ' cal/day</span>Estimated maintenance calories (BMR: ' + Math.round(bmr) + ' cal).<br><span style="font-size:0.78rem; color:#8a7c6a;">For gradual fat loss, try ~' + Math.round(tdee-350) + ' cal/day. For gain, try ~' + Math.round(tdee+350) + ' cal/day.</span>';
    });
  }

  /* ============================================================
     MACRO TARGET + FOOD LOG
  ============================================================ */
  const MACRO_SPLITS = { balanced:{c:0.40,p:0.30,f:0.30}, highprotein:{c:0.35,p:0.40,f:0.25}, lowcarb:{c:0.20,p:0.40,f:0.40} };
  const QUICK_FOODS = [
    { label:'1 Roti', p:3, c:15, f:3, cal:100 }, { label:'1 Cup Dal', p:9, c:20, f:3, cal:140 },
    { label:'1 Boiled Egg', p:6, c:1, f:5, cal:70 }, { label:'100g Paneer', p:18, c:4, f:20, cal:265 },
    { label:'1 Cup Rice', p:4, c:45, f:0, cal:205 }, { label:'1 tbsp Ghee', p:0, c:0, f:14, cal:120 },
    { label:'1 Cup Curd', p:11, c:12, f:8, cal:150 }, { label:'Handful Nuts', p:6, c:7, f:16, cal:180 }
  ];
  let macroTarget = null, macroLogTotals = { p:0,c:0,f:0,cal:0 };
  const macroBtn = document.getElementById('macroBtn');
  if(macroBtn){
    macroBtn.addEventListener('click', ()=>{
      const cal = parseFloat(document.getElementById('macroCal').value);
      const style = document.getElementById('macroGoal').value;
      const box = document.getElementById('macroResult');
      if(!cal){ box.innerHTML = 'Please enter your daily calorie target.'; return; }
      const split = MACRO_SPLITS[style];
      const carbG = Math.round((cal*split.c)/4), proG = Math.round((cal*split.p)/4), fatG = Math.round((cal*split.f)/9);
      macroTarget = { p:proG, c:carbG, f:fatG, cal:cal };
      box.innerHTML = 'Daily Target — <strong>' + proG + 'g protein</strong> · <strong>' + carbG + 'g carbs</strong> · <strong>' + fatG + 'g fat</strong>';
      document.getElementById('macroLog').style.display = 'block';
      const qa = document.getElementById('quickAdd');
      qa.innerHTML = '';
      QUICK_FOODS.forEach(food=>{
        const b = document.createElement('button');
        b.textContent = '+ ' + food.label;
        b.addEventListener('click', ()=>{
          macroLogTotals.p += food.p; macroLogTotals.c += food.c; macroLogTotals.f += food.f; macroLogTotals.cal += food.cal;
          renderMacroBars();
        });
        qa.appendChild(b);
      });
      renderMacroBars();
    });
    function renderMacroBars(){
      if(!macroTarget) return;
      const bars = document.getElementById('macroBars');
      const rows = [
        { label:'Calories', have:macroLogTotals.cal, target:macroTarget.cal, unit:'cal' },
        { label:'Protein', have:macroLogTotals.p, target:macroTarget.p, unit:'g' },
        { label:'Carbs', have:macroLogTotals.c, target:macroTarget.c, unit:'g' },
        { label:'Fat', have:macroLogTotals.f, target:macroTarget.f, unit:'g' }
      ];
      bars.innerHTML = rows.map(r=>{
        const pct = Math.min(100, Math.round((r.have/r.target)*100)) || 0;
        return '<div class="bar-row"><div class="bar-label"><span>' + r.label + '</span><span>' + r.have + ' / ' + r.target + r.unit + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;"></div></div></div>';
      }).join('');
    }
    document.getElementById('resetLogBtn').addEventListener('click', ()=>{ macroLogTotals = {p:0,c:0,f:0,cal:0}; renderMacroBars(); });
  }

  /* ============================================================
     OVULATION INSIGHTS
  ============================================================ */
  const ovBtn = document.getElementById('ovBtn');
  if(ovBtn){
    ovBtn.addEventListener('click', ()=>{
      const lastInput = document.getElementById('ovLast').value;
      const cycleLen = parseInt(document.getElementById('ovCycle').value) || 28;
      const box = document.getElementById('ovResult');
      if(!lastInput){ box.innerHTML = 'Please select the first day of your last period.'; return; }
      const lastDate = new Date(lastInput + 'T00:00:00');
      const today = new Date(); today.setHours(0,0,0,0);
      let nextPeriod = new Date(lastDate);
      while(nextPeriod <= today){ nextPeriod.setDate(nextPeriod.getDate()+cycleLen); }
      const ovulationDate = new Date(nextPeriod); ovulationDate.setDate(ovulationDate.getDate() - 14);
      const fertileStart = new Date(ovulationDate); fertileStart.setDate(fertileStart.getDate() - 5);
      const fertileEnd = new Date(ovulationDate); fertileEnd.setDate(fertileEnd.getDate() + 1);
      function fmt(d){ return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }); }
      box.innerHTML = '<span class="big">' + fmt(ovulationDate) + '</span>Estimated ovulation date<br>Fertile window: <strong>' + fmt(fertileStart) + ' – ' + fmt(fertileEnd) + '</strong>';
    });
  }

  /* ============================================================
     HYDRATION CALCULATOR
  ============================================================ */
  const hydrationBtn = document.getElementById('hydrationBtn');
  if(hydrationBtn){
    hydrationBtn.addEventListener('click', ()=>{
      const unit = getCurrentUnit();
      let weight;
      if(unit === 'metric'){ weight = parseFloat(document.getElementById('weightInputKg').value); }
      else { weight = kgFromLb(parseFloat(document.getElementById('weightInputLb').value)); }
      const activity = parseFloat(document.getElementById('activityInput').value);
      const climate = parseFloat(document.getElementById('climateInput').value);
      const resultBox = document.getElementById('hydrationResult');
      if(!weight || weight <= 0){ resultBox.innerHTML = 'Please enter your weight to calculate.'; resultBox.classList.add('show'); return; }
      const liters = (weight * 0.033) + activity + climate;
      const cups = liters / 0.24;
      const ozTotal = liters * 33.814;
      resultBox.innerHTML = 'Aim for about <strong>' + liters.toFixed(1) + ' litres</strong> (~' + Math.round(cups) + ' cups / ' + Math.round(ozTotal) + ' fl oz) of water today.';
      resultBox.classList.add('show');
    });
  }

  /* ============================================================
     CONTACT FORM  (contact.html)
  ============================================================ */
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', (e)=>{ e.preventDefault(); document.getElementById('contactNote').classList.add('show'); e.target.reset(); });
  }
  const newsletterForm = document.getElementById('newsletterForm');
  if(newsletterForm){
    newsletterForm.addEventListener('submit', (e)=>{ e.preventDefault(); document.getElementById('newsletterNote').classList.add('show'); e.target.reset(); });
  }

})();
