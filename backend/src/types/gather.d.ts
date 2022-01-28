import { Model, PopulatedDoc } from "mongoose";
import { IUserDocument } from "user";
import { IPostDocument } from "post";
import { IPagination } from "pagination";

type categories = "study" | "code" | "team";

export interface IGather {
  area: string;
  isCompleted: boolean;
  memberCount: number;
  members: PopulatedDoc<IUserDocument>[];
  tags: string[];
}

export interface IGatherDocument extends IPostDocument, IGather {
  subject: "gathering";
  category: categories;
}

export interface IGatherModel extends Model<IGatherDocument> {
  findAllGathers: (
    category: string,
    currentPage: number
  ) => Promise<[IGatherDocument[], IPagination]>;

  createGather: (
    user: IUserDocument,
    gatherDto: Partial<IGatherDocument>
  ) => Promise<IGatherDocument>;

  findGatherById: (gatherId: string) => Promise<IGatherDocument>;

  updateGather: (
    gatherId: string,
    gatherDto: Partial<IGatherDocument>
  ) => Promise<void>;

  deleteGather: (gatherId: string) => Promise<void>;
}
