"use client";
import React, { useEffect, useRef, useState } from "react";

const presets = {
  Gray: {
    color1: "#121212",
    color2: "#212121",
    color3: "#383838",
    color4: "#525252",
    color5: "#6b6b6b",
    backgroundColor: "#121212",
  },
};

// Vertex and fragment shader sources
const vertexShaderSource = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentShaderSource = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_color5;
uniform vec3 u_backgroundColor;
uniform float u_fadeIn;

float noise1(float seed1, float seed2){
    return(
           fract(seed1+12.34567*
                 fract(100.*(abs(seed1*0.91)+seed2+94.68)*
                       fract((abs(seed2*0.41)+45.46)*
                             fract((abs(seed2)+757.21)*
                                   fract(seed1*0.0171))))))
    * 1.0038 - 0.00185;
}

float noise2(float seed1, float seed2, float seed3){
    float buff1 = abs(seed1+100.81) + 1000.3;
    float buff2 = abs(seed2+100.45) + 1000.2;
    float buff3 = abs(noise1(seed1, seed2)+seed3) + 1000.1;
    buff1 = (buff3*fract(buff2*fract(buff1*fract(buff2*0.146))));
    buff2 = (buff2*fract(buff2*fract(buff1+buff2*fract(buff3*0.52))));
    buff1 = noise1(buff1, buff2);
    return(buff1);
}

float noise3(float seed1, float seed2, float seed3) {
    float buff1 = abs(seed1+100.813) + 1000.314;
    float buff2 = abs(seed2+100.453) + 1000.213;
    float buff3 = abs(noise1(buff2, buff1)+seed3) + 1000.17;
    buff1 = (buff3*fract(buff2*fract(buff1*fract(buff2*0.14619))));
    buff2 = (buff2*fract(buff2*fract(buff1+buff2*fract(buff3*0.5215))));
    buff1 = noise2(noise1(seed2,buff1), noise1(seed1,buff2), noise1(seed3,buff3));
    return(buff1);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st = vec2(tan(st.x), sin(st.y));

    st.x += (sin(u_time/2.1)+2.0)*0.12*sin(sin(st.y*st.x+u_time/6.0)*8.2);
    st.y -= (cos(u_time/1.73)+2.0)*0.12*cos(st.x*st.y*5.1-u_time/4.0);

    vec3 bg = u_backgroundColor;

    float mixValue = smoothstep(0.0, 0.8, distance(st,vec2(sin(u_time/5.0)+0.5,sin(u_time/6.1)+0.5)));
    vec3 outColor = mix(u_color1,bg,mixValue);

    mixValue = smoothstep(0.1, 0.9, distance(st,vec2(sin(u_time/3.94)+0.7,sin(u_time/4.2)-0.1)));
    outColor = mix(u_color2,outColor,mixValue);

    mixValue = smoothstep(0.1, 0.8, distance(st,vec2(sin(u_time/3.43)+0.2,sin(u_time/3.2)+0.45)));
    outColor = mix(u_color3,outColor,mixValue);

    mixValue = smoothstep(0.14, 0.89, distance(st,vec2(sin(u_time/5.4)-0.3,sin(u_time/5.7)+0.7)));
    outColor = mix(u_color4,outColor,mixValue);

    mixValue = smoothstep(0.01, 0.89, distance(st,vec2(sin(u_time/9.5)+0.23,sin(u_time/3.95)+0.23)));
    outColor = mix(u_color5,outColor,mixValue);

    /// ----

    mixValue = smoothstep(0.01, 0.89, distance(st,vec2(cos(u_time/8.5)/2.+0.13,sin(u_time/4.95)-0.23)));
    outColor = mix(u_color1,outColor,mixValue);

    mixValue = smoothstep(0.1, 0.9, distance(st,vec2(cos(u_time/6.94)/2.+0.7,sin(u_time/4.112)+0.66)));
    outColor = mix(u_color2,outColor,mixValue);

    mixValue = smoothstep(0.1, 0.8, distance(st,vec2(cos(u_time/4.43)/2.+0.2,sin(u_time/6.2)+0.85)));
    outColor = mix(u_color3,outColor,mixValue);

    mixValue = smoothstep(0.14, 0.89, distance(st,vec2(cos(u_time/10.4)/2.-0.3,sin(u_time/5.7)+0.8)));
    outColor = mix(u_color4,outColor,mixValue);

    mixValue = smoothstep(0.01, 0.89, distance(st,vec2(cos(u_time/4.5)/2.+0.63,sin(u_time/4.95)+0.93)));
    outColor = mix(u_color5,outColor,mixValue);

    vec2 st_unwarped = gl_FragCoord.xy/u_resolution.xy;
    vec3 noise = vec3(noise3(st_unwarped.x*0.000001, st_unwarped.y*0.000001, u_time * 1e-15));
    outColor = (outColor * 0.85) - (noise * 0.1);

    // Apply fade-in effect
    float alpha = u_fadeIn;
    
    gl_FragColor = vec4(outColor, alpha);
}`;

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
};

// Create shader
const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

// Create program
const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

export const GradientAnimationShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    uniforms: Record<string, WebGLUniformLocation | null>;
    animationId: number | null;
    startTime: number;
  } | null>(null);
  const timeSpeed = 0.4;
  const fadeInDuration = 2000;
  const [currentPreset] = useState("Gray");
  const { color1, color2, color3, color4, color5, backgroundColor } =
    presets[currentPreset as keyof typeof presets];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas background to transparent immediately
    canvas.style.backgroundColor = "transparent";

    // Get WebGL context with alpha enabled for transparency
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Set clear color to fully transparent FIRST, before any clear calls
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    // Get uniform locations
    const uniforms = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      color1: gl.getUniformLocation(program, "u_color1"),
      color2: gl.getUniformLocation(program, "u_color2"),
      color3: gl.getUniformLocation(program, "u_color3"),
      color4: gl.getUniformLocation(program, "u_color4"),
      color5: gl.getUniformLocation(program, "u_color5"),
      backgroundColor: gl.getUniformLocation(program, "u_backgroundColor"),
      fadeIn: gl.getUniformLocation(program, "u_fadeIn"),
    };

    // Create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Setup attributes
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Use program
    gl.useProgram(program);

    // Store WebGL context and program
    webglRef.current = {
      gl,
      program,
      uniforms,
      animationId: null,
      startTime: Date.now(),
    };

    // Animation loop
    const animate = () => {
      const now = Date.now();
      const elapsed = now - webglRef.current!.startTime;
      const currentTime = elapsed * 0.001 * timeSpeed;

      // Calculate fade-in progress (0 to 1)
      const fadeProgress = Math.min(elapsed / fadeInDuration, 1);
      const fadeAlpha = fadeProgress;

      // Clear the canvas with transparent background
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uniforms.time, currentTime);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform3fv(uniforms.color1, hexToRgb(color1));
      gl.uniform3fv(uniforms.color2, hexToRgb(color2));
      gl.uniform3fv(uniforms.color3, hexToRgb(color3));
      gl.uniform3fv(uniforms.color4, hexToRgb(color4));
      gl.uniform3fv(uniforms.color5, hexToRgb(color5));
      gl.uniform3fv(uniforms.backgroundColor, hexToRgb(backgroundColor));
      gl.uniform1f(uniforms.fadeIn, fadeAlpha);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      webglRef.current!.animationId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Handle page refresh/beforeunload to prevent white flash
    const handleBeforeUnload = () => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "0";
        canvasRef.current.style.transition = "none";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Hide canvas immediately to prevent white flash on unmount
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "0";
        canvasRef.current.style.transition = "none";
      }

      // Clear canvas to transparent before cleanup
      if (webglRef.current?.gl) {
        try {
          const { gl } = webglRef.current;
          gl.clearColor(0.0, 0.0, 0.0, 0.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        } catch (error) {
          // Ignore WebGL context errors during cleanup
        }
      }

      if (webglRef.current?.animationId) {
        cancelAnimationFrame(webglRef.current.animationId);
      }

      resizeObserver.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    color1,
    color2,
    color3,
    color4,
    color5,
    backgroundColor,
    timeSpeed,
    fadeInDuration,
  ]);

  return (
    <div className="w-full h-full block bg-transparent absolute inset-0">
      <canvas
        ref={canvasRef}
        className="opacity-0 dark:opacity-100 transition-opacity duration-300 w-full h-full block bg-transparent"
      />
    </div>
  );
};
