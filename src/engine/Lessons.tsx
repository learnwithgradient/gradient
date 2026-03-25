// Centralized lessons/sections data for the projector curriculum.

export const PROJECTOR_SECTIONS = [
  "Fundamentals",
  "Data Science",
  "Machine Learning",
  "Research",
  "Engineering",
];

export const PROJECTOR_TOPICS = {
  Fundamentals: [
    {
      topic: "Intelligent Systems",
      subtopics: [
        "What Really Is Machine Learning?",
        "AI vs ML vs Deep Learning",
        "Types of Learning Problems",
        "How Models Learn",
        "The ML Workflow",
        "Where ML Is Used Today",
      ],
    },
    {
      topic: "Basic Mathematics",
      subtopics: [
        "Core Objects",
        "Functions",
        "Sequences & Series",
        "Discrete Math",
      ],
    },
    {
      topic: "Logic & Proofs",
      subtopics: ["Boolean Logic", "Formal Logic", "Proof Techniques"],
    },
    {
      topic: "Linear Algebra",
      subtopics: [
        "Vector Spaces",
        "Matrix Operations",
        "Transformations & Geometry",
        "Decompositions",
      ],
    },
    {
      topic: "Spectral Methods",
      subtopics: [
        "Eigenanalysis",
        "Singular Value Decomposition",
        "Matrix Factorizations",
      ],
    },
    {
      topic: "Matrix Calculus",
      subtopics: [
        "Derivatives & Gradients",
        "Second Order Methods",
        "Calculus Rules",
      ],
    },
    {
      topic: "Probability",
      subtopics: [
        "Random Variables",
        "Core Distributions",
        "Conditioning & Dependence",
        "Joint Distributions",
      ],
    },
    {
      topic: "Statistics",
      subtopics: [
        "Estimators",
        "Likelihood Methods",
        "Hypothesis Testing",
        "Uncertainty Quantification",
      ],
    },
    {
      topic: "Information Theory",
      subtopics: ["Entropy & Information", "Divergences", "Mutual Information"],
    },
    {
      topic: "Numerical Computing",
      subtopics: [
        "Floating Point & Stability",
        "Computational Efficiency",
        "Computation Graphs",
      ],
    },
    {
      topic: "Tools",
      subtopics: [
        "Python Core",
        "Scientific Computing",
        "Data & Storage",
        "Developer Tooling",
      ],
    },
    {
      topic: "Data Foundations",
      subtopics: [
        "Data Cleaning",
        "Feature Preparation",
        "Splitting & Leakage",
        "Data Versioning",
      ],
    },
  ],

  "Data Science": [
    {
      topic: "Statistical Inference",
      subtopics: ["Estimation", "Hypothesis Testing", "Multiple Testing"],
    },
    {
      topic: "Experimental Design",
      subtopics: [
        "Experiment Structure",
        "A/B Testing",
        "Confounding & Planning",
      ],
    },
    {
      topic: "Data Preparation",
      subtopics: [
        "Missing & Outlier Handling",
        "Feature Scaling",
        "Categorical Encoding",
        "Feature Design",
      ],
    },
    {
      topic: "Baseline & Regression Models",
      subtopics: [
        "Baselines",
        "Linear Models",
        "Regularized Regression",
        "GLM Extensions",
      ],
    },
    {
      topic: "Probabilistic Models",
      subtopics: [
        "Naive Bayes",
        "Mixture & Latent Models",
        "Bayesian Regression",
        "Calibration",
      ],
    },
    {
      topic: "Distance & Kernel Methods",
      subtopics: [
        "Nearest Neighbor Methods",
        "Support Vector Machines",
        "Kernel Methods",
      ],
    },
    {
      topic: "Tree-Based Models",
      subtopics: ["Decision Trees", "Splitting & Regularization"],
    },
    {
      topic: "Ensemble Methods",
      subtopics: [
        "Bagging & Forests",
        "Boosting Methods",
        "Stacking & Combination",
      ],
    },
    {
      topic: "Dimensionality Reduction",
      subtopics: ["Linear Methods", "Nonlinear Methods"],
    },
    {
      topic: "Unsupervised Learning",
      subtopics: [
        "Centroid & Hierarchical Clustering",
        "Density-Based Clustering",
        "Mixture Clustering",
      ],
    },
    {
      topic: "Time Series",
      subtopics: [
        "Temporal Structure & Stationarity",
        "Classical Forecasting Models",
        "Temporal Validation",
        "Anomaly Detection",
      ],
    },
    {
      topic: "Model Tuning",
      subtopics: [
        "Validation Strategy",
        "Hyperparameter Search",
        "Stopping Criteria",
      ],
    },
    {
      topic: "Evaluation & Diagnostics",
      subtopics: [
        "Classification Metrics",
        "Regression Metrics",
        "Ranking & Calibration Metrics",
        "Error Analysis",
      ],
    },
    {
      topic: "Data Pipelines & Production",
      subtopics: [
        "Pipeline Design",
        "Experiment Tracking",
        "Workflow Orchestration",
      ],
    },
  ],

  "Machine Learning": [
    {
      topic: "Learning Theory",
      subtopics: [
        "Learning Paradigms",
        "Self-Supervised Learning",
        "Risk & Generalization",
        "Capacity & Complexity",
        "Distribution Shift",
      ],
    },
    {
      topic: "Perceptron",
      subtopics: [
        "Threshold Units & Logic Gates",
        "Linear Separability",
        "Perceptron Training",
      ],
    },
    {
      topic: "Neural Networks",
      subtopics: [
        "Network Architecture",
        "Activation Functions",
        "Loss Functions",
        "Backpropagation & Autodiff",
        "Initialization & Normalization",
        "Regularization",
      ],
    },
    {
      topic: "Optimization",
      subtopics: [
        "Gradient Methods",
        "Adaptive & Momentum Optimizers",
        "Learning Schedules",
        "Gradient Controls",
        "Convergence Analysis",
      ],
    },
    {
      topic: "Feedforward Networks",
      subtopics: [
        "Network Depth & Width",
        "Task Heads",
        "Transfer & Contrastive Learning",
      ],
    },
    {
      topic: "Convolutional Networks",
      subtopics: [
        "Convolution Mechanics",
        "Pooling & Connectivity",
        "Canonical CNNs",
        "Efficient CNNs",
      ],
    },
    {
      topic: "Sequence Modeling",
      subtopics: [
        "Recurrent Networks",
        "Gradient Stability",
        "Seq2Seq & Decoding",
      ],
    },
    {
      topic: "Attention & Transformers",
      subtopics: [
        "Attention Mechanics",
        "Masking & Positioning",
        "Transformer Architecture",
        "Transformer Families",
        "Efficient Attention",
      ],
    },
    {
      topic: "Tokenization",
      subtopics: [
        "Tokenization Fundamentals",
        "Subword Methods",
        "Vocabularies & Special Tokens",
      ],
    },
    {
      topic: "Representation Learning",
      subtopics: [
        "Word & Static Embeddings",
        "Contextual Embeddings",
        "Similarity Search",
      ],
    },
    {
      topic: "Autoencoders",
      subtopics: [
        "Autoencoder Basics",
        "Variational Autoencoders",
        "Latent Training Objectives",
      ],
    },
    {
      topic: "Generative Models",
      subtopics: ["GANs", "Diffusion Models", "Flow & Autoregressive Models"],
    },
    {
      topic: "Reinforcement Learning Foundations",
      subtopics: ["MDP Foundations", "Dynamic Programming", "Value Methods"],
    },
    {
      topic: "Policy Learning",
      subtopics: [
        "Policy Gradients",
        "Actor Critic",
        "Exploration & Model-Based RL",
      ],
    },
    {
      topic: "Graph Neural Networks",
      subtopics: [
        "Graph Representation",
        "Message Passing & Architectures",
        "Graph Tasks",
      ],
    },
    {
      topic: "Multimodal Learning",
      subtopics: [
        "Vision-Language Backbones",
        "Audio Representations",
        "Cross-Modal Fusion",
        "Cross-Modal Alignment",
        "Multimodal Generation",
      ],
    },
    {
      topic: "Mixture of Experts",
      subtopics: [
        "MoE Architecture",
        "Expert Routing",
        "Sparse vs Soft MoE",
        "Training & Scaling MoE",
      ],
    },
    {
      topic: "Training At Scale",
      subtopics: [
        "Finetuning Methods",
        "Preference Optimization",
        "Scaling Laws",
        "Parallel Training",
      ],
    },
    {
      topic: "State Space Models",
      subtopics: [
        "LTI Foundations",
        "Structured & Selective SSMs",
        "Hardware-Aware Implementation",
      ],
    },
    {
      topic: "ML Frameworks & Tools",
      subtopics: [
        "PyTorch Stack",
        "TensorFlow & JAX",
        "HuggingFace Stack",
        "Training & Export Tooling",
      ],
    },
  ],

  Research: [
    {
      topic: "Mechanistic Interpretability",
      subtopics: [
        "Circuit Analysis",
        "Feature Superposition & SAEs",
        "Lens & Probing Methods",
      ],
    },
    {
      topic: "Advanced Explainability",
      subtopics: [
        "Gradient Attribution",
        "Shapley Methods",
        "Surrogate & Counterfactual Methods",
      ],
    },
    {
      topic: "AI Safety & Alignment",
      subtopics: [
        "Alignment Taxonomy",
        "Reward Failures",
        "Scalable Oversight",
        "Behavioral Guarantees",
      ],
    },
    {
      topic: "Robustness",
      subtopics: [
        "Adversarial Attacks & Defenses",
        "OOD Detection",
        "Prompt Safety",
      ],
    },
    {
      topic: "Privacy & Secure Learning",
      subtopics: [
        "Federated Learning",
        "Differential Privacy",
        "Privacy Attacks & Governance",
      ],
    },
    {
      topic: "Causal Machine Learning",
      subtopics: [
        "Causal Graphs & Identification",
        "Structural Causality",
        "Treatment Effects",
        "Causal Discovery & Counterfactuals",
      ],
    },
    {
      topic: "Probabilistic & Bayesian Modeling",
      subtopics: [
        "Bayesian Foundations",
        "Inference Methods",
        "Uncertainty Quantification",
        "Gaussian Processes",
      ],
    },
    {
      topic: "Neurosymbolic AI",
      subtopics: [
        "Symbolic Programming & Knowledge Graphs",
        "Differentiable Reasoning",
        "Program Synthesis",
      ],
    },
    {
      topic: "Computer Vision",
      subtopics: [
        "Detection & Segmentation",
        "3D Vision",
        "Video Understanding",
      ],
    },
    {
      topic: "Natural Language Processing",
      subtopics: [
        "Tokenization & Structured NLP",
        "Generation & Summarization",
        "Inference Tasks & Metrics",
      ],
    },
    {
      topic: "Speech & Audio",
      subtopics: [
        "Audio Representations & Spectrograms",
        "Speech Recognition",
        "Text-to-Speech & Neural Vocoders",
        "Audio Generation",
        "Audio Understanding",
      ],
    },
    {
      topic: "Time Series Learning",
      subtopics: [
        "Deep Forecasting",
        "Sequence-to-Sequence Forecasting",
        "Temporal Validation & Anomaly Detection",
      ],
    },
    {
      topic: "Recommender Systems",
      subtopics: [
        "Collaborative Filtering & Latent Factors",
        "Neural Recommenders",
        "Retrieval, Ranking & Tradeoffs",
      ],
    },
    {
      topic: "Graph Machine Learning",
      subtopics: [
        "Graph Construction & Embeddings",
        "Graph Architectures",
        "Graph Prediction Tasks",
      ],
    },
    {
      topic: "LLM Engineering & Agents",
      subtopics: [
        "Prompt Methods",
        "RAG & Vector Search",
        "Tool Calling & Agent Architectures",
        "Memory Management",
      ],
    },
    {
      topic: "LLM Evaluation",
      subtopics: [
        "Benchmarks & Leaderboards",
        "Automated Evaluation Methods",
        "Human Evaluation",
        "Red-Teaming & Safety Evals",
        "Domain-Specific Evaluation",
      ],
    },
    {
      topic: "Emerging Areas",
      subtopics: [
        "World Models & Inference Scaling",
        "Embodied Learning & AI Science",
      ],
    },
    {
      topic: "History I: Early Foundations",
      subtopics: [
        "The Perceptron",
        "Backpropagation",
        "LeNet & CNNs",
        "LSTM",
        "Deep Belief Nets",
      ],
    },
    {
      topic: "History II: The Deep Learning Explosion",
      subtopics: [
        "AlexNet",
        "Word2Vec",
        "VAE",
        "GANs",
        "Seq2Seq",
        "Neural Attention",
        "Dropout",
      ],
    },
    {
      topic: "History III: Architecture Refinement",
      subtopics: [
        "VGGNet",
        "Batch Normalization",
        "ResNet",
        "U-Net",
        "WaveNet",
        "Attention Is All You Need",
      ],
    },
    {
      topic: "History IV: The Transformer Era",
      subtopics: [
        "BERT",
        "GPT",
        "GPT-2",
        "EfficientNet",
        "Scaling Laws",
        "Diffusion Models / DDPM",
        "GPT-3",
      ],
    },
    {
      topic: "History V: Foundation Models & Multimodal",
      subtopics: [
        "CLIP",
        "AlphaFold 2",
        "Vision Transformer / ViT",
        "DALL-E",
        "InstructGPT & RLHF",
        "Chinchilla Scaling Laws",
        "Stable Diffusion",
      ],
    },
    {
      topic: "History VI: The Modern Era",
      subtopics: [
        "LLaMA",
        "GPT-4",
        "Mamba / SSMs",
        "Mixture of Experts / Mixtral",
      ],
    },
  ],

  Engineering: [
    {
      topic: "Hardware & Low-Level Compute",
      subtopics: [
        "Memory Hierarchy",
        "Roofline Analysis",
        "CUDA & Kernel Programming",
        "Accelerator Landscape",
      ],
    },
    {
      topic: "Quantization & Compression",
      subtopics: [
        "Numeric Precision",
        "Posttraining Quantization",
        "Distillation & Pruning",
      ],
    },
    {
      topic: "Inference Efficiency",
      subtopics: [
        "KV Caching",
        "Attention Kernels",
        "Prompt & Prefix Caching",
        "Paged Attention",
      ],
    },
    {
      topic: "Batching & Throughput",
      subtopics: [
        "Batching Strategies",
        "Prefill & Decode Scheduling",
        "Latency & Packing Tradeoffs",
      ],
    },
    {
      topic: "Speculative & Parallel Decoding",
      subtopics: [
        "Speculative Decoding",
        "Draft & Verification Methods",
        "Parallel Decoding Variants",
      ],
    },
    {
      topic: "Distributed Inference & Parallelism",
      subtopics: [
        "Parallelism Strategies",
        "Distributed Collectives",
        "Network Fabrics & Multinode",
      ],
    },
    {
      topic: "Training Systems",
      subtopics: [
        "Distributed Training",
        "ZeRO & Memory Optimization",
        "Mixed Precision & Fault Tolerance",
      ],
    },
    {
      topic: "Serving Infrastructure",
      subtopics: [
        "Inference Servers & Frameworks",
        "Autoscaling & Model Operations",
        "API Protocols & Latency Controls",
      ],
    },
    {
      topic: "Observability & Reliability",
      subtopics: [
        "Profiling & Utilization",
        "Stability & Memory Diagnostics",
        "Deployment & Drift Monitoring",
      ],
    },
    {
      topic: "Cost & Efficiency Tradeoffs",
      subtopics: [
        "Cost Modeling & Estimation",
        "Caching & Batching Economics",
        "Hardware & Cluster Tradeoffs",
      ],
    },
  ],
};
