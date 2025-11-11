export class UploadVideoDto {
  sceneId: number;
  title: string;
  script: any;
  scenes: any[];
  aspectRatio: string;
  totalDurationSec: number;
  status?: string;
}