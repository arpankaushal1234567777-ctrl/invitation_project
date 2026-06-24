import React, { useEffect, useRef, useState } from "react";
import {
  isSupabaseConfigured,
  supabase,
  SUPABASE_MUSIC_BUCKET,
  SUPABASE_MUSIC_PATH,
  SUPABASE_MUSIC_ROW_ID,
  SUPABASE_GALLERY_BUCKET,
  VALID_IMAGE_TYPES,
  VALID_IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE,
  MAX_IMAGES_PER_GALLERY,
} from "./supabase.js";

const STORAGE_KEY = "wedding-invitation-config";
const ADMIN_PASSWORD = "wedding2026";

const defaultData = {
  uiText: {
    openingPrompt: "Tap to Reveal",
    dateKicker: "THE DATE",
    dateTitle: "Save the Date",
    dateSubtitle: "Scratch below to reveal our wedding date",
    storyKicker: "OUR STORY",
    storyTitle: "Forever Us",
    venueKicker: "WHERE",
    venueTitle: "The Venue",
    festivitiesKicker: "THE CELEBRATIONS UNFOLD",
    festivitiesTitle: "Festivities",
    countdownQuote: "A lifetime of togetherness begins with one sacred step",
    countdownTitle: "The Wedding",
  },
  couple: {
    brideName: "Meenal",
    groomName: "Avinash",
    initialsMonogram: "M & A",
    brideParents: "Mr. & Mrs. Sharma",
    groomParents: "Mr. & Mrs. Patel",
    shloka:
      "॥ श्री गणेशाय नमः ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥",
    inviteText:
      "With the blessings of Shri Ganesh and our beloved families, we joyfully invite you to celebrate the union of",
  },
  weddingDate: "2026-07-01T10:00:00",
  saveTheDate: { month: "JULY", day: "01", year: "2026" },
  story: {
    photos: [
      { url: "https://picsum.photos/400/500?random=1", caption: "Memories together" },
      { url: "https://picsum.photos/400/500?random=2", caption: "Laughter" },
      { url: "https://picsum.photos/400/500?random=3", caption: "Forever" },
    ],
    gallery: [],
  },
  venue: {
    name: "Rajalakshmi Kalyana Mandapam",
    address:
      "No. 205/1, Velachery Main Road, Dhandeeswaram, Velachery, Chennai, Tamil Nadu — 600042",
    imageUrl: "https://picsum.photos/400/300?random=10",
    mapsUrl: "https://maps.google.com",
    gallery: [],
  },
  festivities: [
    {
      id: 1,
      name: "Sangeet Night",
      date: "Tuesday · 10 · June 2026",
      time: "7:00 PM",
      quote: "An evening of music, dance, and endless celebration.",
      dressCode: {
        colors: ["#6b2d2d", "#c9a84c", "#f5f0eb"],
        names: "Maroon · Gold · Cream",
        style: "TRADITIONAL INDIAN/INDO-WESTERN",
      },
      venue: "Accord Wildlife Pench Resort · Grand Courtyard",
      imageUrl: "https://picsum.photos/400/280?random=21",
      mapsUrl: "https://maps.google.com",
      gallery: [],
    },
    {
      id: 2,
      name: "The Wedding",
      date: "Wednesday · 01 · July 2026",
      time: "10:00 AM",
      quote: "A lifetime of togetherness begins with one sacred step.",
      dressCode: {
        colors: ["#c9a84c", "#ffffff", "#e8b4b8"],
        names: "Gold · White · Pink",
        style: "TRADITIONAL INDIAN",
      },
      venue: "Rajalakshmi Kalyana Mandapam",
      imageUrl: "https://picsum.photos/400/280?random=22",
      mapsUrl: "https://maps.google.com",
      gallery: [],
    },
    {
      id: 3,
      name: "Reception Soiree",
      date: "Wednesday · 01 · July 2026",
      time: "7:30 PM",
      quote: "A graceful evening of blessings, dinner, and dancing hearts.",
      dressCode: {
        colors: ["#c4a0a0", "#c9a84c", "#fdf6f0"],
        names: "Mauve · Gold · Ivory",
        style: "ELEGANT ETHNIC / FORMAL",
      },
      venue: "Moonlight Pavilion · Lakeview Lawns",
      imageUrl: "https://picsum.photos/400/280?random=23",
      mapsUrl: "https://maps.google.com",
      gallery: [],
    },
  ],
  music: {
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    autoplay: true,
    startSection: "opening",
    sourceType: "url",
    fileName: "",
    clipStartSeconds: 0,
    clipLengthSeconds: 30,
  },
};

const MUSIC_SECTION_OPTIONS = [
  { value: "opening", label: "Opening Reveal" },
  { value: "date", label: "Save the Date" },
  { value: "countdown", label: "Countdown" },
  { value: "story", label: "Our Story" },
  { value: "venue", label: "Venue" },
  { value: "festivities", label: "Festivities" },
];

function mergeWithDefaults(defaultValue, savedValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(savedValue) ? savedValue : defaultValue;
  }
  if (defaultValue && typeof defaultValue === "object") {
    const merged = { ...defaultValue };
    const source = savedValue && typeof savedValue === "object" ? savedValue : {};
    Object.keys(source).forEach((key) => {
      merged[key] = key in defaultValue ? mergeWithDefaults(defaultValue[key], source[key]) : source[key];
    });
    return merged;
  }
  return savedValue ?? defaultValue;
}

function loadInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? mergeWithDefaults(defaultData, JSON.parse(saved)) : defaultData;
  } catch {
    return defaultData;
  }
}

function formatCountdown(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return { days: "00", hours: "00", mins: "00", secs: "00" };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
  };
}

function createPetals(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${12 + Math.random() * 18}s`,
    scale: 0.7 + Math.random() * 0.9,
    rotate: Math.random() * 360,
    color: ["#e8b4b8", "#c9a84c", "#c4a0a0"][index % 3],
  }));
}

function updateNestedValue(setter, path, value) {
  setter((current) => {
    const next = JSON.parse(JSON.stringify(current));
    let cursor = next;
    for (let i = 0; i < path.length - 1; i += 1) {
      cursor = cursor[path[i]];
    }
    cursor[path[path.length - 1]] = value;
    return next;
  });
}

// Image upload utilities
function isValidImage(file) {
  return VALID_IMAGE_TYPES.includes(file.type);
}

function getImageExtension(file) {
  const name = file.name.toLowerCase();
  return VALID_IMAGE_EXTENSIONS.find(ext => name.endsWith(ext)) || ".jpg";
}

async function uploadImageToSupabase(file, galleryType, eventId = null) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  if (!isValidImage(file) || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Invalid image format or size too large");
  }

  const timestamp = Date.now();
  const eventFolder = eventId ? `events/${eventId}` : galleryType;
  const storagePath = `${eventFolder}/${timestamp}-${Math.random().toString(36).slice(2, 9)}${getImageExtension(file)}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_GALLERY_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: "0",
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_GALLERY_BUCKET)
      .getPublicUrl(storagePath);

    return {
      imageUrl: `${publicUrlData.publicUrl}?v=${timestamp}`,
      storagePath,
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function persistGalleryImageRow({ galleryType, eventId, imageUrl, storagePath }) {
  const { data, error } = await supabase
    .from("gallery_images")
    .insert([
      {
        gallery_type: galleryType,
        event_id: eventId,
        image_url: imageUrl,
        storage_path: storagePath,
      },
    ])
    .select();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) throw error;
}

async function deleteGalleryImageRow(storagePath) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("storage_path", storagePath);

  if (error) {
    throw error;
  }
}

async function deleteImageFromSupabase(storagePath) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_GALLERY_BUCKET)
      .remove([storagePath]);

    if (error) throw error;

    await deleteGalleryImageRow(storagePath);
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

function ImageUploader({ galleryType, eventId, onUpload, onError, maxImages = MAX_IMAGES_PER_GALLERY, currentCount = 0, multiple = true, buttonLabel = "Choose Images" }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    const selectedFiles = Array.from(files);
    const uploadFiles = multiple ? selectedFiles : selectedFiles.slice(0, 1);

    const validFiles = uploadFiles.filter((f) => {
      if (!isValidImage(f)) {
        onError(`${f.name} is not a valid image format`);
        return false;
      }
      if (f.size > MAX_IMAGE_SIZE) {
        onError(`${f.name} is too large (max 20MB)`);
        return false;
      }
      return true;
    });

    if (currentCount + validFiles.length > maxImages) {
      onError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      for (let fileIndex = 0; fileIndex < validFiles.length; fileIndex += 1) {
        const file = validFiles[fileIndex];
        const result = await uploadImageToSupabase(file, galleryType, eventId);
        await persistGalleryImageRow({
          galleryType,
          eventId,
          imageUrl: result.imageUrl,
          storagePath: result.storagePath,
        });
        onUpload(
          {
            imageUrl: result.imageUrl,
            storagePath: result.storagePath,
            caption: file.name.replace(/\.[^/.]+$/, ""),
          },
          fileIndex
        );
      }
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div className={`image-uploader ${dragging ? 'dragging' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={VALID_IMAGE_EXTENSIONS.join(",")}
        onChange={handleFileSelect}
        disabled={uploading || currentCount >= maxImages}
        className="file-input"
      />
      <button
        type="button"
        className="pill-button dark"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || currentCount >= maxImages}
      >
        {uploading ? "Uploading..." : buttonLabel}
      </button>
      {multiple ? <small>{currentCount}/{maxImages} images</small> : null}
      {preview && (
        <div className="image-preview-modal">
          <img src={preview} alt="Preview" />
          <button className="ghost-button" onClick={() => setPreview(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

function ScratchCard({ label, value }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    const resize = () => {
      const rect = wrapperRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      context.globalCompositeOperation = "source-over";
      context.fillStyle = "#c4878a";
      context.fillRect(0, 0, rect.width, rect.height);
      context.fillStyle = "#fdf6f0";
      context.font = "600 18px Jost";
      context.textAlign = "center";
      context.fillText("SCRATCH", rect.width / 2, rect.height / 2 + 6);
      setRevealed(false);
      setBurst(false);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);

  const revealCheck = () => {
    if (revealed) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparentPixels += 1;
    }
    if (transparentPixels / (data.length / 4) > 0.48) {
      setRevealed(true);
      setBurst(true);
      context.clearRect(0, 0, canvas.width, canvas.height);
      window.setTimeout(() => setBurst(false), 1200);
    }
  };

  const scratchAt = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(clientX - rect.left, clientY - rect.top, 18, 0, Math.PI * 2);
    context.fill();
    revealCheck();
  };

  const handlePointer = (event) => {
    if (!isDrawing || revealed) return;
    scratchAt(event.clientX, event.clientY);
  };

  return (
    <div className="scratch-block">
      <div className="scratch-label">{label}</div>
      <div
        ref={wrapperRef}
        className={`scratch-card ${revealed ? "revealed" : ""}`}
        onMouseDown={(event) => {
          setIsDrawing(true);
          scratchAt(event.clientX, event.clientY);
        }}
        onMouseMove={handlePointer}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          setIsDrawing(true);
          scratchAt(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          event.preventDefault();
          handlePointer(event);
        }}
        onPointerUp={() => setIsDrawing(false)}
        onPointerCancel={() => setIsDrawing(false)}
      >
        <div className="scratch-value">{value}</div>
        <canvas ref={canvasRef} className="scratch-overlay" />
        {burst && (
          <div className="confetti-layer">
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                className="confetti-dot"
                style={{
                  "--x": `${Math.cos((index / 12) * Math.PI * 2) * 56}px`,
                  "--y": `${Math.sin((index / 12) * Math.PI * 2) * 56}px`,
                  background: ["#c9a84c", "#e8b4b8", "#6b2d2d", "#f0ba4c"][index % 4],
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RevealOnScroll({ as: Tag = "div", className = "", children, delay = 0 }) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={elementRef}
      className={`reveal-on-scroll ${visible ? "visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

function App() {
  const [data, setData] = useState(loadInitialData);
  const [screen, setScreen] = useState("opening");
  const [showAdmin, setShowAdmin] = useState(window.location.hash === "#/admin");
  const [adminPrompt, setAdminPrompt] = useState(window.location.hash === "#/admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminTab, setAdminTab] = useState("Couple Info");
  const [savedToast, setSavedToast] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [musicSyncMessage, setMusicSyncMessage] = useState("");
  const [countdown, setCountdown] = useState(formatCountdown(defaultData.weddingDate));
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicPreviewing, setMusicPreviewing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [petals] = useState(() => createPetals(26));
  const audioRef = useRef(null);
  const nextSectionRef = useRef(null);
  const sectionRefs = useRef({});
  const clipTimeoutRef = useRef(null);
  const objectUrlRef = useRef("");
  const pendingMusicFileRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";
    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";
    const link3 = document.createElement("link");
    link3.rel = "stylesheet";
    link3.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,700&family=Great+Vibes&family=Jost:wght@300;400;500;600&display=swap";
    document.head.append(link, link2, link3);
    return () => {
      link.remove();
      link2.remove();
      link3.remove();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(formatCountdown(data.weddingDate)), 1000);
    return () => window.clearInterval(timer);
  }, [data.weddingDate]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === "#/admin") {
        setAdminPrompt(true);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    setCountdown(formatCountdown(data.weddingDate));
  }, [data.weddingDate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = data.music.audioUrl || "";
    }
  }, [data.music.audioUrl]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }
    let cancelled = false;

    async function loadSharedMusicConfig() {
      const { data: musicRow, error } = await supabase
        .from("site_music")
        .select("audio_url, file_name, start_section, clip_start_seconds, clip_length_seconds, source_type")
        .eq("id", SUPABASE_MUSIC_ROW_ID)
        .single();

      if (cancelled || error || !musicRow) return;

      setData((current) => ({
        ...current,
        music: {
          ...current.music,
          audioUrl: musicRow.audio_url || current.music.audioUrl,
          fileName: musicRow.file_name || "",
          startSection: musicRow.start_section || current.music.startSection,
          clipStartSeconds: musicRow.clip_start_seconds ?? current.music.clipStartSeconds,
          clipLengthSeconds: musicRow.clip_length_seconds ?? current.music.clipLengthSeconds,
          sourceType: musicRow.source_type || "url",
        },
      }));
    }

    async function loadGalleryImages() {
      const { data: rows, error } = await supabase
        .from("gallery_images")
        .select("gallery_type,event_id,image_url,storage_path");

      if (cancelled || error || !rows) return;

      setData((current) => {
        const next = JSON.parse(JSON.stringify(current));
        next.story.gallery = [];
        next.venue.gallery = [];
        next.festivities = next.festivities.map((event) => ({ ...event, gallery: [] }));

        rows.forEach((row) => {
          const image = { imageUrl: row.image_url, storagePath: row.storage_path };
          if (row.gallery_type === "story") {
            next.story.gallery.push(image);
          } else if (row.gallery_type === "venue") {
            next.venue.gallery.push(image);
          } else if (row.gallery_type === "festivity") {
            const eventIndex = next.festivities.findIndex((event) => String(event.id) === String(row.event_id));
            if (eventIndex !== -1) {
              next.festivities[eventIndex].gallery.push(image);
            }
          }
        });

        return next;
      });
    }

    loadSharedMusicConfig();
    loadGalleryImages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => {
    if (clipTimeoutRef.current) {
      window.clearTimeout(clipTimeoutRef.current);
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
  }, []);

  useEffect(() => {
    if (!audioUnlocked || !data.music.audioUrl || data.music.startSection === "opening") return undefined;
    const targetNode = sectionRefs.current[data.music.startSection];
    if (!targetNode) return undefined;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || musicPlaying) return;
        try {
          await playConfiguredClip();
          observer.disconnect();
        } catch {
          setMusicPlaying(false);
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(targetNode);
    return () => observer.disconnect();
  }, [
    audioUnlocked,
    data.music.audioUrl,
    data.music.startSection,
    data.music.clipStartSeconds,
    data.music.clipLengthSeconds,
    musicPlaying,
    screen,
  ]);

  const formattedDate = (() => {
    const date = new Date(data.weddingDate);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month} · ${day} · ${year}`;
  })();

  const stopClipTimer = () => {
    if (clipTimeoutRef.current) {
      window.clearTimeout(clipTimeoutRef.current);
      clipTimeoutRef.current = null;
    }
  };

  const pauseMusic = () => {
    stopClipTimer();
    audioRef.current?.pause();
    setMusicPlaying(false);
    setMusicPreviewing(false);
  };

  const playConfiguredClip = async (source = "live") => {
    if (!audioRef.current || !data.music.audioUrl) return;
    stopClipTimer();
    const startAt = Number(data.music.clipStartSeconds || 0);
    const clipLength = Number(data.music.clipLengthSeconds || 0);
    try {
      if (audioRef.current.readyState < 1) {
        await new Promise((resolve, reject) => {
          const handleLoaded = () => {
            audioRef.current?.removeEventListener("loadedmetadata", handleLoaded);
            audioRef.current?.removeEventListener("error", handleError);
            resolve();
          };
          const handleError = () => {
            audioRef.current?.removeEventListener("loadedmetadata", handleLoaded);
            audioRef.current?.removeEventListener("error", handleError);
            reject(new Error("audio-load-failed"));
          };
          audioRef.current?.addEventListener("loadedmetadata", handleLoaded, { once: true });
          audioRef.current?.addEventListener("error", handleError, { once: true });
          audioRef.current?.load();
        });
      }
      audioRef.current.currentTime = startAt;
      await audioRef.current.play();
      setMusicPlaying(true);
      setMusicPreviewing(source === "preview");
      if (clipLength > 0) {
        clipTimeoutRef.current = window.setTimeout(() => {
          audioRef.current?.pause();
          setMusicPlaying(false);
          setMusicPreviewing(false);
        }, clipLength * 1000);
      }
    } catch {
      setMusicPlaying(false);
      setMusicPreviewing(false);
    }
  };

  const startExperience = async () => {
    setScreen("reveal");
    setAudioUnlocked(true);
    if (audioRef.current && data.music.audioUrl && data.music.startSection === "opening") {
      await playConfiguredClip();
    }
    window.setTimeout(() => setScreen("invitation"), 2500);
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      pauseMusic();
    } else {
      await playConfiguredClip();
    }
  };

  const saveData = () => {
    persistAllData();
  };

  const handleMusicFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      pendingMusicFileRef.current = file;
      setData((current) => ({
        ...current,
        music: {
          ...current.music,
          audioUrl: objectUrl,
          sourceType: "upload",
          fileName: file.name,
        },
      }));
      setSaveError("");
      setMusicSyncMessage("MP3 selected. Click Save to upload it to Supabase.");
      window.setTimeout(() => setMusicSyncMessage(""), 2200);
    } catch {
      setSaveError("Could not prepare the uploaded MP3.");
      window.setTimeout(() => setSaveError(""), 2200);
    }
  };

  const persistMusicToSupabase = async (currentData) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: "Supabase env vars are missing." };
    }

    let finalAudioUrl = currentData.music.audioUrl;
    let finalFileName = currentData.music.fileName;
    let finalSourceType = currentData.music.sourceType;

    if (pendingMusicFileRef.current) {
      const fileOptions = {
        contentType: pendingMusicFileRef.current.type || "audio/mpeg",
        cacheControl: "0",
      };

      const { error: updateError } = await supabase.storage
        .from(SUPABASE_MUSIC_BUCKET)
        .update(SUPABASE_MUSIC_PATH, pendingMusicFileRef.current, fileOptions);

      let finalUploadError = updateError;

      if (updateError) {
        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_MUSIC_BUCKET)
          .upload(SUPABASE_MUSIC_PATH, pendingMusicFileRef.current, fileOptions);
        finalUploadError = uploadError;
      }

      if (finalUploadError) {
        console.error("Supabase music upload failed", finalUploadError);
        return { success: false, message: `Upload failed: ${finalUploadError.message}` };
      }

      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_MUSIC_BUCKET)
        .getPublicUrl(SUPABASE_MUSIC_PATH);

      finalAudioUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      finalFileName = pendingMusicFileRef.current.name;
      finalSourceType = "upload";
    }

    const { error: upsertError } = await supabase.from("site_music").upsert(
      {
        id: SUPABASE_MUSIC_ROW_ID,
        audio_url: finalAudioUrl,
        file_name: finalFileName,
        start_section: currentData.music.startSection,
        clip_start_seconds: Number(currentData.music.clipStartSeconds || 0),
        clip_length_seconds: Number(currentData.music.clipLengthSeconds || 0),
        source_type: finalSourceType,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.error("Supabase music row save failed", upsertError);
      return { success: false, message: `Music settings failed: ${upsertError.message}` };
    }

    pendingMusicFileRef.current = null;
    setData((current) => ({
      ...current,
      music: {
        ...current.music,
        audioUrl: finalAudioUrl,
        fileName: finalFileName,
        sourceType: finalSourceType,
      },
    }));

    return { success: true, message: "Music synced to Supabase." };
  };

  const persistAllData = async () => {
    try {
      const payload = JSON.parse(JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      const musicResult = await persistMusicToSupabase(payload);
      if (!musicResult.success) {
        setSaveError(musicResult.message);
        window.setTimeout(() => setSaveError(""), 2600);
        return;
      }

      setSaveError("");
      setMusicSyncMessage(musicResult.message);
      setSavedToast(true);
      window.setTimeout(() => setSavedToast(false), 1800);
      window.setTimeout(() => setMusicSyncMessage(""), 2200);
    } catch {
      setSaveError("Could not save settings in this browser.");
      window.setTimeout(() => setSaveError(""), 2200);
    }
  };

  const scrollIntoInvitation = () => {
    if (!nextSectionRef.current) return;
    nextSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isInvitationVisible = !showAdmin || previewMode;
  const adminTabs = [
    "Couple Info",
    "Save the Date",
    "Countdown / Wedding Date",
    "Photo Gallery",
    "Venue",
    "Festivities",
    "Music & Opening",
  ];

  return (
    <>
      <style>{styles}</style>
      <audio ref={audioRef} loop preload="auto" />
      {isInvitationVisible && (
        <>
          <div className="petal-field">
            {petals.map((petal) => (
              <span
                key={petal.id}
                className="petal"
                style={{
                  left: petal.left,
                  top: petal.top,
                  background: petal.color,
                  animationDelay: petal.delay,
                  animationDuration: petal.duration,
                  transform: `scale(${petal.scale}) rotate(${petal.rotate}deg)`,
                }}
              />
            ))}
          </div>
          <div className="page-shell">
            {screen === "opening" && (
              <section className="opening-screen" onClick={startExperience}>
                <div className="tap-label">{data.uiText.openingPrompt}</div>
                <div className="envelope">
                  <div className="envelope-flap" />
                  <div className="seal">
                    <span>{data.couple.initialsMonogram}</span>
                  </div>
                </div>
              </section>
            )}
            {screen === "reveal" && (
              <section className="reveal-screen">
                <div className="reveal-bloom" />
                <div className="sparkle-ring">
                  {Array.from({ length: 24 }, (_, index) => (
                    <span
                      key={index}
                      className="spark"
                      style={{ transform: `rotate(${index * 15}deg) translateY(-140px)` }}
                    />
                  ))}
                </div>
              </section>
            )}
            {screen === "invitation" && (
              <main className="invitation-shell">
                <RevealOnScroll as="section" className="section visible-immediately">
                  <div className="hero-card">
                    <div className="ganesha">ॐ</div>
                    <p className="shloka">{data.couple.shloka}</p>
                    <p className="invite-copy">{data.couple.inviteText}</p>
                    <h1 className="name-display">{data.couple.brideName}</h1>
                    <div className="ampersand-row">
                      <span />
                      <strong>&amp;</strong>
                      <span />
                    </div>
                    <h1 className="name-display">{data.couple.groomName}</h1>
                    <p className="parents-line">
                      Daughter of {data.couple.brideParents}
                      <br />
                      Son of {data.couple.groomParents}
                    </p>
                    <button className="scroll-cue" onClick={scrollIntoInvitation}>
                      <span>Scroll Down</span>
                      <strong>⌄</strong>
                    </button>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll as="section" className="section" delay={60}>
                  <div
                    ref={(node) => {
                      nextSectionRef.current = node;
                      sectionRefs.current.date = node;
                    }}
                  />
                  <p className="section-kicker">{data.uiText.dateKicker}</p>
                  <h2 className="section-title">{data.uiText.dateTitle}</h2>
                  <p className="section-subtitle">{data.uiText.dateSubtitle}</p>
                  <div className="scratch-grid">
                    <ScratchCard label="MONTH" value={data.saveTheDate.month} />
                    <ScratchCard label="DAY" value={data.saveTheDate.day} />
                    <ScratchCard label="YEAR" value={data.saveTheDate.year} />
                  </div>
                </RevealOnScroll>

                <RevealOnScroll as="section" className="section" delay={80}>
                  <div ref={(node) => { sectionRefs.current.countdown = node; }} />
                  <div className="countdown-card">
                    <p className="countdown-copy">{data.uiText.countdownQuote}</p>
                    <h2 className="script-title">{data.uiText.countdownTitle}</h2>
                    <div className="date-stamp">{formattedDate}</div>
                    <div className="countdown-grid">
                      {[
                        ["DAYS", countdown.days],
                        ["HOURS", countdown.hours],
                        ["MINS", countdown.mins],
                        ["SECS", countdown.secs],
                      ].map(([label, val]) => (
                        <div key={label} className="countdown-box">
                          <div className="countdown-value">{val}</div>
                          <div className="countdown-label">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll as="section" className="section" delay={100}>
                  <div ref={(node) => { sectionRefs.current.story = node; }} />
                  <p className="section-kicker">{data.uiText.storyKicker}</p>
                  <h2 className="section-title">{data.uiText.storyTitle}</h2>
                  <div className="polaroid-stack">
                    {data.story.photos.slice(0, 5).map((photo, index) => (
                      <RevealOnScroll
                        key={`${photo.url}-${index}`}
                        as="figure"
                        className="polaroid-card"
                        delay={index * 120}
                      >
                        <div
                          className="tilt-frame"
                          style={{ "--polaroid-tilt": `${index % 2 === 0 ? -2 : 2}deg` }}
                        >
                          <img src={photo.url} alt={photo.caption} />
                        </div>
                        <figcaption>{photo.caption}</figcaption>
                      </RevealOnScroll>
                    ))}
                  </div>
                </RevealOnScroll>

                <RevealOnScroll as="section" className="section" delay={120}>
                  <div ref={(node) => { sectionRefs.current.venue = node; }} />
                  <p className="section-kicker">{data.uiText.venueKicker}</p>
                  <h2 className="section-title">{data.uiText.venueTitle}</h2>
                  <div className="venue-card">
                    <img src={data.venue.imageUrl} alt={data.venue.name} className="venue-image" />
                    <div className="venue-separator">✦</div>
                    <h3>{data.venue.name}</h3>
                    <p>{data.venue.address}</p>
                    <a className="pill-button" href={data.venue.mapsUrl} target="_blank" rel="noreferrer">
                      📍 GET DIRECTIONS
                    </a>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll as="section" className="section" delay={140}>
                  <div ref={(node) => { sectionRefs.current.festivities = node; }} />
                  <p className="section-kicker">{data.uiText.festivitiesKicker}</p>
                  <h2 className="section-title">{data.uiText.festivitiesTitle}</h2>
                  <div className="festivity-list">
                    {data.festivities.map((event, index) => (
                      <RevealOnScroll
                        key={event.id}
                        as="article"
                        className="event-card"
                        delay={index * 120}
                      >
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.name} className="event-image" />
                        ) : null}
                        <h3>{event.name}</h3>
                        <p className="event-meta">
                          {event.date} <span>·</span> {event.time}
                        </p>
                        <p className="event-quote">{event.quote}</p>
                        <div className="dress-code">
                          <div className="swatches">
                            {event.dressCode.colors.map((color, index) => (
                              <span key={index} className="swatch" style={{ background: color }} />
                            ))}
                          </div>
                          <div className="dress-copy">
                            <strong>{event.dressCode.names}</strong>
                            <span>{event.dressCode.style}</span>
                          </div>
                        </div>
                        <p className="event-venue">{event.venue}</p>
                        <a className="pill-button" href={event.mapsUrl} target="_blank" rel="noreferrer">
                          📍 GET DIRECTIONS
                        </a>
                      </RevealOnScroll>
                    ))}
                  </div>
                </RevealOnScroll>

                <footer className="footer">
                  <button className="admin-link" onClick={() => setAdminPrompt(true)}>
                    Admin
                  </button>
                </footer>
              </main>
            )}
          </div>
          {screen === "invitation" && (
            <button className="music-toggle" onClick={toggleMusic}>
              {musicPlaying ? "🔊" : "🔇"}
            </button>
          )}
        </>
      )}

      {adminPrompt && (
        <div className="modal-backdrop">
          <div className="password-modal">
            <h3>Admin Access</h3>
            <input
              type="password"
              value={adminPassword}
              placeholder="Enter password"
              onChange={(event) => setAdminPassword(event.target.value)}
            />
            <div className="modal-actions">
              <button
                className="ghost-button"
                onClick={() => {
                  setAdminPrompt(false);
                  window.location.hash = "";
                }}
              >
                Cancel
              </button>
              <button
                className="pill-button dark"
                onClick={() => {
                  if (adminPassword === ADMIN_PASSWORD) {
                    setAdminPassword("");
                    setAdminPrompt(false);
                    setShowAdmin(true);
                    setPreviewMode(false);
                    window.location.hash = "#/admin";
                  }
                }}
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdmin && (
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <h2>Dashboard</h2>
            {adminTabs.map((tab) => (
              <button
                key={tab}
                className={adminTab === tab ? "active" : ""}
                onClick={() => setAdminTab(tab)}
              >
                {tab}
              </button>
            ))}
            <button className="pill-button dark" onClick={() => setPreviewMode((value) => !value)}>
              {previewMode ? "Hide Preview" : "Preview Invitation"}
            </button>
            <button className="pill-button save" onClick={saveData}>
              Save
            </button>
            {musicSyncMessage ? <div className="admin-status success">{musicSyncMessage}</div> : null}
            {saveError ? <div className="admin-status error">{saveError}</div> : null}
            <button
              className="ghost-button"
              onClick={() => {
                setShowAdmin(false);
                setPreviewMode(false);
                window.location.hash = "";
              }}
            >
              Close Admin
            </button>
          </aside>
          <section className="admin-panel">
            {adminTab === "Couple Info" && (
              <div className="form-grid">
                <Field label="Bride Name" value={data.couple.brideName} onChange={(value) => updateNestedValue(setData, ["couple", "brideName"], value)} />
                <Field label="Groom Name" value={data.couple.groomName} onChange={(value) => updateNestedValue(setData, ["couple", "groomName"], value)} />
                <Field label="Monogram" value={data.couple.initialsMonogram} onChange={(value) => updateNestedValue(setData, ["couple", "initialsMonogram"], value)} />
                <Field label="Bride's Parents" value={data.couple.brideParents} onChange={(value) => updateNestedValue(setData, ["couple", "brideParents"], value)} />
                <Field label="Groom's Parents" value={data.couple.groomParents} onChange={(value) => updateNestedValue(setData, ["couple", "groomParents"], value)} />
                <TextArea label="Shloka" value={data.couple.shloka} onChange={(value) => updateNestedValue(setData, ["couple", "shloka"], value)} />
                <TextArea label="Invite Text" value={data.couple.inviteText} onChange={(value) => updateNestedValue(setData, ["couple", "inviteText"], value)} />
                <Field label="Opening Prompt" value={data.uiText.openingPrompt} onChange={(value) => updateNestedValue(setData, ["uiText", "openingPrompt"], value)} />
              </div>
            )}

            {adminTab === "Save the Date" && (
              <div className="form-grid">
                <Field label="Section Kicker" value={data.uiText.dateKicker} onChange={(value) => updateNestedValue(setData, ["uiText", "dateKicker"], value)} />
                <Field label="Section Title" value={data.uiText.dateTitle} onChange={(value) => updateNestedValue(setData, ["uiText", "dateTitle"], value)} />
                <TextArea label="Section Subtitle" value={data.uiText.dateSubtitle} onChange={(value) => updateNestedValue(setData, ["uiText", "dateSubtitle"], value)} />
                <Field label="Month" value={data.saveTheDate.month} onChange={(value) => updateNestedValue(setData, ["saveTheDate", "month"], value)} />
                <Field label="Day" value={data.saveTheDate.day} onChange={(value) => updateNestedValue(setData, ["saveTheDate", "day"], value)} />
                <Field label="Year" value={data.saveTheDate.year} onChange={(value) => updateNestedValue(setData, ["saveTheDate", "year"], value)} />
              </div>
            )}

            {adminTab === "Countdown / Wedding Date" && (
              <div className="form-grid">
                <Field label="Countdown Title" value={data.uiText.countdownTitle} onChange={(value) => updateNestedValue(setData, ["uiText", "countdownTitle"], value)} />
                <TextArea label="Countdown Quote" value={data.uiText.countdownQuote} onChange={(value) => updateNestedValue(setData, ["uiText", "countdownQuote"], value)} />
                <Field
                  label="Wedding Date"
                  type="datetime-local"
                  value={data.weddingDate.slice(0, 16)}
                  onChange={(value) => updateNestedValue(setData, ["weddingDate"], value)}
                />
              </div>
            )}

            {adminTab === "Photo Gallery" && (
              <div className="repeater-list">
                <div className="repeater-card">
                  <Field label="Section Kicker" value={data.uiText.storyKicker} onChange={(value) => updateNestedValue(setData, ["uiText", "storyKicker"], value)} />
                  <Field label="Section Title" value={data.uiText.storyTitle} onChange={(value) => updateNestedValue(setData, ["uiText", "storyTitle"], value)} />
                </div>
                <div className="repeater-card">
                  <h4>URL-Based Photos</h4>
                  {data.story.photos.map((photo, index) => (
                    <div key={index} className="repeater-card nested">
                      <Field label="Photo URL" value={photo.url} onChange={(value) => updateNestedValue(setData, ["story", "photos", index, "url"], value)} />
                      <ImageUploader
                        multiple={false}
                        buttonLabel="Upload Photo"
                        galleryType="story"
                        onUpload={(image) =>
                          updateNestedValue(setData, ["story", "photos", index, "url"], image.imageUrl)
                        }
                        onError={(msg) => {
                          setSaveError(msg);
                          window.setTimeout(() => setSaveError(""), 2200);
                        }}
                      />
                      <Field label="Caption" value={photo.caption} onChange={(value) => updateNestedValue(setData, ["story", "photos", index, "caption"], value)} />
                      <button
                        className="ghost-button"
                        onClick={() =>
                          setData((current) => ({
                            ...current,
                            story: {
                              ...current.story,
                              photos: current.story.photos.filter((_, itemIndex) => itemIndex !== index),
                            },
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {data.story.photos.length < 5 && (
                    <button
                      className="pill-button dark"
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          story: {
                            ...current.story,
                            photos: [...current.story.photos, { url: "https://picsum.photos/400/500", caption: "New memory" }],
                          },
                        }))
                      }
                    >
                      Add URL Photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {adminTab === "Venue" && (
              <div className="form-grid">
                <Field label="Section Kicker" value={data.uiText.venueKicker} onChange={(value) => updateNestedValue(setData, ["uiText", "venueKicker"], value)} />
                <Field label="Section Title" value={data.uiText.venueTitle} onChange={(value) => updateNestedValue(setData, ["uiText", "venueTitle"], value)} />
                <Field label="Venue Name" value={data.venue.name} onChange={(value) => updateNestedValue(setData, ["venue", "name"], value)} />
                <Field label="Venue Image URL" value={data.venue.imageUrl} onChange={(value) => updateNestedValue(setData, ["venue", "imageUrl"], value)} />
                <ImageUploader
                  multiple={false}
                  buttonLabel="Upload Venue Image"
                  galleryType="venue"
                  onUpload={(image) => updateNestedValue(setData, ["venue", "imageUrl"], image.imageUrl)}
                  onError={(msg) => {
                    setSaveError(msg);
                    window.setTimeout(() => setSaveError(""), 2200);
                  }}
                />
                <Field label="Maps URL" value={data.venue.mapsUrl} onChange={(value) => updateNestedValue(setData, ["venue", "mapsUrl"], value)} />
                <TextArea label="Address" value={data.venue.address} onChange={(value) => updateNestedValue(setData, ["venue", "address"], value)} />
              </div>
            )}

            {adminTab === "Festivities" && (
              <div className="repeater-list">
                <div className="repeater-card">
                  <Field label="Section Kicker" value={data.uiText.festivitiesKicker} onChange={(value) => updateNestedValue(setData, ["uiText", "festivitiesKicker"], value)} />
                  <Field label="Section Title" value={data.uiText.festivitiesTitle} onChange={(value) => updateNestedValue(setData, ["uiText", "festivitiesTitle"], value)} />
                </div>
                {data.festivities.map((event, index) => (
                  <div key={event.id} className="repeater-card">
                    <h3>{event.name}</h3>
                    <Field label="Event Name" value={event.name} onChange={(value) => updateNestedValue(setData, ["festivities", index, "name"], value)} />
                    <Field label="Date Label" value={event.date} onChange={(value) => updateNestedValue(setData, ["festivities", index, "date"], value)} />
                    <Field label="Time" value={event.time} onChange={(value) => updateNestedValue(setData, ["festivities", index, "time"], value)} />
                    <Field label="Event Image URL" value={event.imageUrl || ""} onChange={(value) => updateNestedValue(setData, ["festivities", index, "imageUrl"], value)} />
                    <ImageUploader
                      multiple={false}
                      buttonLabel="Upload Event Image"
                      galleryType="festivity"
                      eventId={event.id}
                      onUpload={(image) => updateNestedValue(setData, ["festivities", index, "imageUrl"], image.imageUrl)}
                      onError={(msg) => {
                        setSaveError(msg);
                        window.setTimeout(() => setSaveError(""), 2200);
                      }}
                    />
                    <TextArea label="Quote" value={event.quote} onChange={(value) => updateNestedValue(setData, ["festivities", index, "quote"], value)} />
                    <Field label="Dress Code Style" value={event.dressCode.style} onChange={(value) => updateNestedValue(setData, ["festivities", index, "dressCode", "style"], value)} />
                    <Field label="Venue" value={event.venue} onChange={(value) => updateNestedValue(setData, ["festivities", index, "venue"], value)} />
                    <Field label="Maps URL" value={event.mapsUrl} onChange={(value) => updateNestedValue(setData, ["festivities", index, "mapsUrl"], value)} />
                    <div className="color-row">
                      {event.dressCode.colors.map((color, colorIndex) => (
                        <label key={colorIndex}>
                          Color {colorIndex + 1}
                          <input
                            type="color"
                            value={color}
                            onChange={(eventValue) =>
                              updateNestedValue(
                                setData,
                                ["festivities", index, "dressCode", "colors", colorIndex],
                                eventValue.target.value
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      className="ghost-button"
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          festivities: current.festivities.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      Remove Event
                    </button>
                  </div>
                ))}
                <button
                  className="pill-button dark"
                  onClick={() =>
                    setData((current) => ({
                      ...current,
                      festivities: [
                        ...current.festivities,
                        {
                          id: Date.now(),
                          name: "New Event",
                          date: "Friday · 12 · June 2026",
                          time: "6:00 PM",
                          quote: "Add celebration details here.",
                          dressCode: {
                            colors: ["#6b2d2d", "#c9a84c", "#fdf6f0"],
                            names: "Maroon · Gold · Cream",
                            style: "FESTIVE",
                          },
                          venue: "Event Venue",
                          imageUrl: "https://picsum.photos/400/280?random=31",
                          mapsUrl: "https://maps.google.com",
                          gallery: [],
                        },
                      ],
                    }))
                  }
                >
                  Add Event
                </button>
              </div>
            )}

            {adminTab === "Music & Opening" && (
              <div className="form-grid">
                <Field
                  label="Music URL"
                  value={data.music.sourceType === "upload" ? "" : data.music.audioUrl}
                  onChange={(value) => {
                    pendingMusicFileRef.current = null;
                    setData((current) => ({
                      ...current,
                      music: {
                        ...current.music,
                        audioUrl: value,
                        sourceType: "url",
                        fileName: "",
                      },
                    }));
                  }}
                />
                <SelectField
                  label="Play Music From"
                  value={data.music.startSection}
                  options={MUSIC_SECTION_OPTIONS}
                  onChange={(value) => updateNestedValue(setData, ["music", "startSection"], value)}
                />
                <Field
                  label="Clip Start (seconds)"
                  type="number"
                  value={data.music.clipStartSeconds}
                  onChange={(value) =>
                    updateNestedValue(setData, ["music", "clipStartSeconds"], Number(value) || 0)
                  }
                />
                <Field
                  label="Clip Length (seconds)"
                  type="number"
                  value={data.music.clipLengthSeconds}
                  onChange={(value) =>
                    updateNestedValue(setData, ["music", "clipLengthSeconds"], Number(value) || 0)
                  }
                />
                <label className="field full upload-field">
                  <span>Upload MP3 From Device</span>
                  <input type="file" accept=".mp3,audio/mpeg,audio/*" onChange={handleMusicFileUpload} />
                  <small>
                    {data.music.sourceType === "upload" && data.music.fileName
                      ? `Selected for global upload: ${data.music.fileName}`
                      : "Choose a downloaded MP3, then click Save to publish it globally via Supabase."}
                  </small>
                </label>
                <div className="field full music-preview-card">
                  <span>Preview Clip In Admin</span>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="pill-button dark"
                      onClick={() => playConfiguredClip("preview")}
                    >
                      Play Selected Part
                    </button>
                    <button type="button" className="ghost-button" onClick={pauseMusic}>
                      Stop
                    </button>
                  </div>
                  <small>
                    {musicPreviewing
                      ? "Previewing the selected section of the song."
                      : "Set a start time and length, then test the exact clip here."}
                  </small>
                </div>
                <div className="field full music-preview-card">
                  <span>Music Storage Mode</span>
                  <small>
                    {isSupabaseConfigured
                      ? "Supabase is configured. Saving here updates the one shared song for all visitors."
                      : "Supabase env vars are missing. Add them before expecting global music sync."}
                  </small>
                  <small>Storage bucket in use: {SUPABASE_MUSIC_BUCKET}</small>
                </div>
                <Field label="Opening Prompt" value={data.uiText.openingPrompt} onChange={(value) => updateNestedValue(setData, ["uiText", "openingPrompt"], value)} />
                <Field label="Admin Password" value={ADMIN_PASSWORD} disabled onChange={() => {}} />
              </div>
            )}
          </section>
        </div>
      )}

      {savedToast && <div className="toast">Saved ✓</div>}
      {musicSyncMessage && <div className="toast sync">{musicSyncMessage}</div>}
      {saveError && <div className="toast error">{saveError}</div>}
    </>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="field full">
      <span>{label}</span>
      <textarea rows="4" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const styles = `
  :root {
    color: #6b2d2d;
    background: #fdf6f0;
    font-family: 'Jost', sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fdf6f0; color: #6b2d2d; }
  a { text-decoration: none; }
  button, input, textarea { font: inherit; }
  select { font: inherit; }
  .page-shell { min-height: 100vh; position: relative; z-index: 2; }
  .reveal-on-scroll {
    opacity: 0;
    transform: translate3d(0, 44px, 0) scale(0.985);
    filter: blur(8px);
    transition:
      opacity 0.9s ease,
      transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.9s ease;
    will-change: opacity, transform, filter;
  }
  .reveal-on-scroll.visible,
  .reveal-on-scroll.visible-immediately {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
  .petal-field { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .petal {
    position: absolute;
    width: 18px;
    height: 28px;
    border-radius: 60% 40% 55% 45%;
    opacity: 0.55;
    filter: blur(0.2px);
    animation: petalFall linear infinite;
  }
  @keyframes petalFall {
    0% { transform: translate3d(0, -8vh, 0) rotate(0deg); opacity: 0; }
    10% { opacity: 0.7; }
    100% { transform: translate3d(30px, 110vh, 0) rotate(260deg); opacity: 0; }
  }
  .opening-screen, .reveal-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .opening-screen {
    background:
      radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 35%),
      linear-gradient(180deg, #6e2222, #461010);
    cursor: pointer;
    flex-direction: column;
  }
  .tap-label {
    position: absolute;
    top: clamp(44px, 10vh, 84px);
    color: #fff6ec;
    font-family: 'Great Vibes', cursive;
    font-size: clamp(28px, 8vw, 40px);
    letter-spacing: 1px;
    text-align: center;
    padding: 0 16px;
  }
  .envelope {
    --envelope-width: min(84vw, 360px);
    --envelope-half: calc(var(--envelope-width) / 2);
    --envelope-flap: calc(var(--envelope-width) / 3);
    --seal-size: clamp(120px, 34vw, 200px);
    width: var(--envelope-width);
    height: calc(var(--envelope-width) * 0.67);
    position: relative;
    background: linear-gradient(180deg, #f4e9db, #e9d9c6);
    border-radius: 12px;
    box-shadow: 0 28px 60px rgba(0,0,0,0.28);
  }
  .envelope::before, .envelope::after, .envelope-flap {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    width: 0;
    height: 0;
    border-style: solid;
  }
  .envelope::before {
    top: 0;
    border-width: var(--envelope-flap) var(--envelope-half) 0 var(--envelope-half);
    border-color: #f7efe6 transparent transparent transparent;
  }
  .envelope::after {
    bottom: 0;
    border-width: 0 var(--envelope-half) var(--envelope-flap) var(--envelope-half);
    border-color: transparent transparent #dfc7af transparent;
  }
  .envelope-flap {
    top: 0;
    border-width: 0 var(--envelope-half) var(--envelope-flap) var(--envelope-half);
    border-color: transparent transparent #ecdcc9 transparent;
    z-index: 2;
  }
  .seal {
    position: absolute;
    inset: 0;
    margin: auto;
    width: var(--seal-size);
    height: var(--seal-size);
    border-radius: 50%;
    background: radial-gradient(circle, #fff7ea, #eadcc9 70%);
    border: 4px double rgba(107,45,45,0.3);
    z-index: 3;
    display: grid;
    place-items: center;
    box-shadow: 0 0 30px rgba(255,255,255,0.1), inset 0 0 40px rgba(201,168,76,0.25);
  }
  .seal span { font-family: 'Great Vibes', cursive; font-size: clamp(36px, 10vw, 56px); color: #6b2d2d; }
  .reveal-screen { background: #3f0e0e; }
  .reveal-bloom {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff9dc 0%, #f5c842 20%, #e8872a 50%, rgba(232,135,42,0.1) 72%, transparent 100%);
    animation: bloom 2.5s ease-out forwards;
  }
  .sparkle-ring { position: relative; width: 100%; height: 100%; }
  .spark {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 120px;
    transform-origin: center 140px;
    background: linear-gradient(180deg, rgba(255,255,255,0.9), transparent);
    animation: flash 1.8s ease-out forwards;
  }
  @keyframes bloom {
    0% { transform: scale(0); opacity: 0.9; }
    70% { transform: scale(28); opacity: 1; }
    100% { transform: scale(44); opacity: 0; }
  }
  @keyframes flash {
    0% { opacity: 0; }
    30% { opacity: 1; }
    100% { opacity: 0; }
  }
  .invitation-shell {
    width: min(100%, 480px);
    margin: 0 auto;
    min-height: 100vh;
    padding: 28px 0 120px;
    position: relative;
    z-index: 2;
  }
  .section { padding: 18px 16px 26px; }
  .hero-card, .countdown-card, .venue-card, .event-card {
    background: rgba(255,255,255,0.95);
    border-radius: 24px;
    box-shadow: 0 24px 50px rgba(107,45,45,0.08);
  }
  .hero-card { padding: 28px 24px 34px; text-align: center; }
  .ganesha { font-size: 58px; color: #c9a84c; line-height: 1; }
  .shloka, .invite-copy, .parents-line, .countdown-copy, .venue-card p, .event-quote, .event-meta, .event-venue {
    color: #6b2d2d;
  }
  .shloka { font-style: italic; font-size: 13px; line-height: 1.7; }
  .invite-copy, .countdown-copy, .venue-card p, .event-quote { font-style: italic; font-weight: 300; line-height: 1.8; }
  .name-display {
    margin: 8px 0;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(54px, 11vw, 72px);
    font-style: italic;
    font-weight: 600;
  }
  .ampersand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    color: #c9a84c;
    margin: 12px 0;
  }
  .ampersand-row strong { font-family: 'Great Vibes', cursive; font-size: 42px; }
  .ampersand-row span { width: 72px; height: 1px; background: linear-gradient(90deg, transparent, #c9a84c, transparent); }
  .parents-line { font-size: 14px; }
  .scroll-cue {
    margin: 22px auto 0;
    padding: 0;
    background: transparent;
    color: #8b5656;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    letter-spacing: 2px;
    font-size: 10px;
    text-transform: uppercase;
  }
  .scroll-cue strong {
    font-size: 20px;
    line-height: 1;
    color: #c9a84c;
    animation: scrollBounce 1.6s ease-in-out infinite;
  }
  @keyframes scrollBounce {
    0%, 100% { transform: translateY(0); opacity: 0.7; }
    50% { transform: translateY(8px); opacity: 1; }
  }
  .section-kicker {
    text-align: center;
    letter-spacing: 3px;
    font-size: 11px;
    color: #c9a84c;
    margin: 0 0 6px;
  }
  .section-title, .script-title {
    margin: 0;
    text-align: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    font-weight: 600;
  }
  .script-title { font-family: 'Great Vibes', cursive; font-size: 46px; color: #6b2d2d; }
  .section-subtitle { text-align: center; font-style: italic; font-weight: 300; margin-bottom: 18px; }
  .scratch-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .scratch-label, .countdown-label { font-size: 10px; letter-spacing: 2px; text-align: center; color: #8f6666; margin-bottom: 8px; }
  .scratch-card {
    position: relative;
    height: 126px;
    border-radius: 20px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 18px 28px rgba(107,45,45,0.08);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .scratch-value, .date-stamp {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(24px, 5vw, 34px);
    font-weight: 700;
    letter-spacing: 2px;
  }
  .scratch-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  .confetti-layer { position: absolute; inset: 0; pointer-events: none; }
  .confetti-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    left: calc(50% - 5px);
    top: calc(50% - 5px);
    animation: burst 0.95s ease-out forwards;
  }
  @keyframes burst {
    to { transform: translate(var(--x), var(--y)) scale(0); opacity: 0; }
  }
  .countdown-card { padding: 24px 18px; text-align: center; }
  .date-stamp { position: static; margin: 10px 0 20px; }
  .countdown-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .countdown-box {
    background: linear-gradient(180deg, #fffaf2, #f7ece0);
    border-radius: 18px;
    padding: 16px 6px;
  }
  .countdown-value { font-size: 30px; font-weight: 600; }
  .polaroid-stack { display: flex; flex-direction: column; gap: 18px; margin-top: 18px; }
  .polaroid-card {
    background: #fff;
    padding: 14px 14px 18px;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(107,45,45,0.1);
  }
  .tilt-frame {
    transform: rotate(var(--polaroid-tilt, 0deg));
    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal-on-scroll.visible .tilt-frame,
  .reveal-on-scroll.visible-immediately .tilt-frame {
    transform: rotate(var(--polaroid-tilt, 0deg));
  }
  .polaroid-card img, .venue-image, .event-image {
    width: 100%;
    display: block;
    border-radius: 6px;
    object-fit: cover;
  }
  .polaroid-card img { height: 300px; }
  .event-image {
    height: 180px;
    margin-bottom: 14px;
    border-radius: 18px;
  }
  .polaroid-card figcaption {
    text-align: center;
    font-family: 'Great Vibes', cursive;
    font-size: 30px;
    margin-top: 12px;
  }
  .venue-card, .event-card { padding: 16px; text-align: center; }
  .venue-image { height: 220px; margin-bottom: 16px; }
  .venue-separator { color: #c9a84c; font-size: 22px; }
  .venue-card h3, .event-card h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    margin: 10px 0 8px;
    font-style: italic;
  }
  .festivity-list { display: flex; flex-direction: column; gap: 16px; }
  .event-meta span { color: #c9a84c; }
  .dress-code {
    margin: 16px 0;
    padding: 14px;
    background: #fbf4ec;
    border-radius: 18px;
  }
  .swatches { display: flex; gap: 8px; justify-content: center; margin-bottom: 10px; }
  .swatch { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(107,45,45,0.1); }
  .dress-copy { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
  .dress-copy span, .event-venue { font-size: 13px; letter-spacing: 0.4px; }
  .pill-button, .ghost-button, .admin-link, .music-toggle {
    border: 0;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .pill-button:hover, .ghost-button:hover, .music-toggle:hover { transform: translateY(-1px); }
  .pill-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 18px;
    border-radius: 999px;
    background: #6b2d2d;
    color: #fff;
    font-size: 13px;
    letter-spacing: 1px;
    margin-top: 8px;
  }
  .pill-button.dark { background: #6b2d2d; }
  .pill-button.save { background: #22c55e; }
  .music-toggle {
    position: fixed;
    right: 18px;
    bottom: 18px;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: #6b2d2d;
    color: #fff;
    font-size: 22px;
    box-shadow: 0 20px 30px rgba(107,45,45,0.2);
    z-index: 4;
  }
  .footer { text-align: center; padding: 8px 16px; }
  .admin-link {
    background: transparent;
    color: rgba(107,45,45,0.5);
    font-size: 12px;
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(50, 12, 12, 0.55);
    display: grid;
    place-items: center;
    z-index: 20;
    padding: 18px;
  }
  .password-modal {
    width: min(100%, 360px);
    background: #fff;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 28px 50px rgba(0,0,0,0.18);
  }
  .password-modal h3 { margin-top: 0; font-family: 'Cormorant Garamond', serif; font-size: 34px; }
  .password-modal input, .field input, .field textarea {
    width: 100%;
    border: 1px solid #ead7c5;
    border-radius: 14px;
    padding: 12px 14px;
    background: #fffaf5;
  }
  .field select {
    width: 100%;
    border: 1px solid #ead7c5;
    border-radius: 14px;
    padding: 12px 14px;
    background: #fffaf5;
  }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
  .ghost-button {
    padding: 12px 16px;
    border-radius: 999px;
    background: #f4ece4;
    color: #6b2d2d;
  }
  .admin-shell {
    position: fixed;
    inset: 0;
    z-index: 10;
    background: #f7efe6;
    display: grid;
    grid-template-columns: 280px 1fr;
  }
  .admin-sidebar {
    padding: 24px;
    background: #ffffff;
    border-right: 1px solid #ead9ca;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .admin-sidebar h2 { margin: 0 0 8px; font-family: 'Cormorant Garamond', serif; font-size: 36px; }
  .admin-sidebar button {
    text-align: left;
    padding: 12px 14px;
    border-radius: 14px;
    background: transparent;
    color: #6b2d2d;
  }
  .admin-sidebar button.active { background: #f7efe6; font-weight: 600; }
  .admin-status {
    padding: 10px 12px;
    border-radius: 14px;
    font-size: 12px;
    line-height: 1.5;
  }
  .admin-status.success {
    background: rgba(15,118,110,0.1);
    color: #0f766e;
  }
  .admin-status.error {
    background: rgba(185,28,28,0.1);
    color: #b91c1c;
  }
  .admin-panel {
    padding: 24px;
    overflow: auto;
  }
  .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 8px; }
  .field span { font-size: 13px; font-weight: 500; }
  .field.full { grid-column: 1 / -1; }
  .upload-field small {
    color: #8b6565;
    line-height: 1.5;
  }
  .music-preview-card {
    background: #fff;
    border: 1px solid #ead9ca;
    border-radius: 18px;
    padding: 14px;
  }
  .inline-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .repeater-list { display: flex; flex-direction: column; gap: 16px; }
  .repeater-card {
    background: #fff;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 18px 36px rgba(107,45,45,0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .color-row { display: flex; flex-wrap: wrap; gap: 12px; }
  .color-row label { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
  .color-row input { width: 56px; height: 40px; padding: 0; border: 0; background: transparent; }
  .toast {
    position: fixed;
    top: 18px;
    right: 18px;
    background: #22c55e;
    color: #fff;
    padding: 12px 16px;
    border-radius: 999px;
    z-index: 30;
    box-shadow: 0 16px 26px rgba(34,197,94,0.24);
  }
  .toast.error {
    background: #b91c1c;
    box-shadow: 0 16px 26px rgba(185,28,28,0.24);
  }
  .toast.sync {
    top: 72px;
    background: #0f766e;
    box-shadow: 0 16px 26px rgba(15,118,110,0.24);
  }
  .image-uploader {
    border: 2px dashed #ead7c5;
    border-radius: 18px;
    padding: 16px;
    text-align: center;
    background: #fffaf5;
    transition: all 0.2s ease;
  }
  .image-uploader.dragging {
    border-color: #c9a84c;
    background: #fffbf8;
  }
  .image-uploader .file-input {
    display: none;
  }
  .image-uploader small {
    display: block;
    margin-top: 8px;
    color: #8b6565;
    font-size: 12px;
  }
  .gallery-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .gallery-item {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    background: #f0ebe0;
    aspect-ratio: 1;
  }
  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .gallery-actions {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .gallery-item:hover .gallery-actions {
    opacity: 1;
  }
  .gallery-actions button {
    background: rgba(255,255,255,0.9) !important;
    color: #6b2d2d !important;
    font-size: 12px;
    padding: 8px 12px !important;
  }
  .repeater-card.nested {
    background: #f9f3ec;
    margin-left: 12px;
    margin-right: 0;
  }
  .repeater-card h3, .repeater-card h4 {
    margin: 0 0 12px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
  }
  .repeater-card h4 {
    font-size: 16px;
  }
  @media (max-width: 900px) {
    .admin-shell { grid-template-columns: 1fr; }
    .admin-sidebar { border-right: 0; border-bottom: 1px solid #ead9ca; }
    .form-grid { grid-template-columns: 1fr; }
  }
`;

export default App;
